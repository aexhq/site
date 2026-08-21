import { isIP } from "node:net";
import { pathToFileURL } from "node:url";

const API_ORIGIN = "https://api.vercel.com";
const NOTE_PREFIX = "aex-managed-sandbox:";

export function parseManagedSandboxCidrs(value) {
  let parsed;
  try {
    parsed = JSON.parse(value);
  } catch {
    throw new TypeError("managed sandbox NAT CIDRs must be a JSON array");
  }
  if (!Array.isArray(parsed) || parsed.length !== 3) {
    throw new TypeError("managed sandbox NAT CIDRs must contain exactly three entries");
  }

  const cidrs = parsed.map((item) => {
    if (typeof item !== "string" || !item.endsWith("/32")) {
      throw new TypeError("every managed sandbox NAT CIDR must be an IPv4 /32");
    }
    const address = item.slice(0, -3);
    if (isIP(address) !== 4) {
      throw new TypeError("every managed sandbox NAT CIDR must be an IPv4 /32");
    }
    return `${address}/32`;
  });
  if (new Set(cidrs).size !== cidrs.length) {
    throw new TypeError("managed sandbox NAT CIDRs must be distinct");
  }
  return cidrs.sort();
}

export async function syncManagedSandboxFirewall({
  token,
  teamId,
  projectId,
  cidrs,
  fetchImpl = fetch,
  verifyAttempts = 10,
  verifyDelayMs = 2_000,
}) {
  for (const [name, value] of Object.entries({ token, teamId, projectId })) {
    if (typeof value !== "string" || value.length === 0) {
      throw new TypeError(`${name} is required`);
    }
  }
  if (!Array.isArray(cidrs) || cidrs.length !== 3 || new Set(cidrs).size !== 3) {
    throw new TypeError("cidrs must be the validated three-address set");
  }
  cidrs = parseManagedSandboxCidrs(JSON.stringify(cidrs));

  const request = async (path, init = {}) => {
    const url = new URL(path, API_ORIGIN);
    url.searchParams.set("projectId", projectId);
    url.searchParams.set("teamId", teamId);
    const response = await fetchImpl(url, {
      ...init,
      headers: {
        authorization: `Bearer ${token}`,
        accept: "application/json",
        ...(init.body === undefined ? {} : { "content-type": "application/json" }),
      },
      signal: AbortSignal.timeout(15_000),
      redirect: "error",
    });
    if (!response.ok) {
      throw new Error(`Vercel firewall ${init.method ?? "GET"} failed with HTTP ${response.status}`);
    }
    const body = await response.text();
    return body.length === 0 ? undefined : JSON.parse(body);
  };

  const update = (body) => request("/v1/security/firewall/config", {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  const read = () => request("/v1/security/firewall/config/active");

  const initial = await read();
  assertConfigShape(initial);

  const owned = initial.ips.filter((entry) => entry.notes?.startsWith(NOTE_PREFIX));
  const collision = initial.ips.find((entry) => (
    cidrs.includes(entry.ip)
    && !entry.notes?.startsWith(NOTE_PREFIX)
  ));
  if (collision !== undefined) {
    throw new Error(`Vercel firewall has an unowned rule for required CIDR ${collision.ip}`);
  }
  const keepByCidr = new Map();
  for (const entry of owned) {
    if (cidrs.includes(entry.ip) && !keepByCidr.has(entry.ip)) {
      keepByCidr.set(entry.ip, entry);
    }
  }

  // Install or repair every desired deny before removing stale/duplicate entries. A rotation can
  // temporarily over-block one old NAT identity, but it never creates a direct-access window.
  for (const cidr of cidrs) {
    const expected = {
      action: "deny",
      hostname: "*",
      ip: cidr,
      notes: `${NOTE_PREFIX}${cidr}`,
    };
    const current = keepByCidr.get(cidr);
    if (current === undefined) {
      await update({ action: "ip.insert", id: null, value: expected });
    } else if (
      current.action !== expected.action
      || current.hostname !== expected.hostname
      || current.notes !== expected.notes
    ) {
      await update({ action: "ip.update", id: current.id, value: expected });
    }
  }

  const retainedIds = new Set([...keepByCidr.values()].map((entry) => entry.id));
  for (const entry of owned) {
    if (!retainedIds.has(entry.id) || !cidrs.includes(entry.ip)) {
      await update({ action: "ip.remove", id: entry.id, value: null });
    }
  }
  if (!initial.firewallEnabled) {
    await update({ action: "firewallEnabled", id: null, value: true });
  }

  for (let attempt = 0; attempt < verifyAttempts; attempt += 1) {
    const active = await read();
    assertConfigShape(active);
    if (matchesExpected(active, cidrs)) return active;
    if (attempt + 1 < verifyAttempts) await delay(verifyDelayMs);
  }
  throw new Error("Vercel firewall did not converge to the exact managed-sandbox deny set");
}

function assertConfigShape(config) {
  if (
    config === null
    || typeof config !== "object"
    || typeof config.firewallEnabled !== "boolean"
    || !Array.isArray(config.ips)
    || config.ips.some((entry) => (
      entry === null
      || typeof entry !== "object"
      || typeof entry.id !== "string"
      || typeof entry.ip !== "string"
    ))
  ) {
    throw new TypeError("Vercel returned an invalid firewall configuration");
  }
}

function matchesExpected(config, cidrs) {
  if (!config.firewallEnabled) return false;
  const owned = config.ips.filter((entry) => entry.notes?.startsWith(NOTE_PREFIX));
  if (owned.length !== cidrs.length) return false;
  return cidrs.every((cidr) => owned.some((entry) => (
    entry.ip === cidr
    && entry.hostname === "*"
    && entry.action === "deny"
    && entry.notes === `${NOTE_PREFIX}${cidr}`
  )));
}

function delay(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

async function main() {
  const cidrs = parseManagedSandboxCidrs(process.env.AEX_MANAGED_SANDBOX_NAT_CIDRS ?? "");
  await syncManagedSandboxFirewall({
    token: process.env.VERCEL_TOKEN,
    teamId: process.env.VERCEL_ORG_ID,
    projectId: process.env.VERCEL_PROJECT_ID,
    cidrs,
  });
  console.log(`Verified ${cidrs.length} managed-sandbox source denies on every project hostname.`);
}

if (process.argv[1] !== undefined && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
