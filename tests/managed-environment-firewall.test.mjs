import assert from "node:assert/strict";
import test from "node:test";

import {
  parseManagedEnvironmentCidrs,
  syncManagedEnvironmentFirewall,
} from "../scripts/sync-managed-environment-firewall.mjs";

const DESIRED = ["198.51.100.1/32", "198.51.100.2/32", "198.51.100.3/32"];

test("validates the exact three distinct IPv4 /32 boundary", () => {
  assert.deepEqual(
    parseManagedEnvironmentCidrs('["198.51.100.3/32","198.51.100.1/32","198.51.100.2/32"]'),
    DESIRED,
  );
  for (const invalid of [
    "",
    "[]",
    '["198.51.100.1/32","198.51.100.2/32"]',
    '["198.51.100.1/32","198.51.100.1/32","198.51.100.2/32"]',
    '["198.51.100.1/24","198.51.100.2/32","198.51.100.3/32"]',
    '["999.51.100.1/32","198.51.100.2/32","198.51.100.3/32"]',
  ]) {
    assert.throws(() => parseManagedEnvironmentCidrs(invalid));
  }
});

test("adds before removing and converges without disturbing unrelated rules", async () => {
  const state = {
    firewallEnabled: false,
    ips: [
      rule("old", "198.51.100.9/32"),
      rule("repair", DESIRED[0], { action: "log" }),
      rule("duplicate", DESIRED[0]),
      { id: "customer", hostname: "example.com", ip: "203.0.113.9/32", notes: "customer", action: "deny" },
    ],
  };
  const actions = [];
  const fetchImpl = fakeVercel(state, actions);

  await syncManagedEnvironmentFirewall({
    token: "token",
    teamId: "team",
    projectId: "project",
    cidrs: DESIRED,
    fetchImpl,
    verifyDelayMs: 0,
  });

  assert.equal(state.firewallEnabled, true);
  assert.deepEqual(
    state.ips.filter((entry) => entry.notes?.startsWith("aex-managed-sandbox:")).map((entry) => entry.ip).sort(),
    DESIRED,
  );
  assert.ok(state.ips.some((entry) => entry.id === "customer"));
  const firstRemove = actions.findIndex((action) => action.action === "ip.remove");
  const lastInstall = actions.findLastIndex((action) => ["ip.insert", "ip.update"].includes(action.action));
  assert.ok(firstRemove > lastInstall, "stale rules were removed before replacements existed");
});

test("fails closed on an API error without exposing credentials", async () => {
  await assert.rejects(
    syncManagedEnvironmentFirewall({
      token: "secret-token",
      teamId: "team",
      projectId: "project",
      cidrs: DESIRED,
      fetchImpl: async () => new Response("sensitive upstream body", { status: 500 }),
      verifyAttempts: 1,
    }),
    (error) => {
      assert.match(error.message, /HTTP 500/);
      assert.doesNotMatch(error.message, /secret-token|sensitive upstream body/);
      return true;
    },
  );
});

test("fails closed instead of taking over an unowned rule", async () => {
  const state = {
    firewallEnabled: true,
    ips: [{ id: "customer", hostname: "*", ip: DESIRED[0], notes: "customer", action: "deny" }],
  };
  const actions = [];
  await assert.rejects(
    syncManagedEnvironmentFirewall({
      token: "token",
      teamId: "team",
      projectId: "project",
      cidrs: DESIRED,
      fetchImpl: fakeVercel(state, actions),
      verifyAttempts: 1,
    }),
    /unowned rule/,
  );
  assert.deepEqual(actions, []);
});

test("initializes an absent firewall before adding the managed denies", async () => {
  const actions = [];
  const active = await syncManagedEnvironmentFirewall({
    token: "token",
    teamId: "team",
    projectId: "project",
    cidrs: DESIRED,
    fetchImpl: fakeVercel(null, actions),
    verifyDelayMs: 0,
  });

  assert.deepEqual(actions[0], { method: "PUT", body: { firewallEnabled: true } });
  assert.equal(active.firewallEnabled, true);
  assert.deepEqual(active.ips.map((entry) => entry.ip).sort(), DESIRED);
});

function rule(id, ip, additions = {}) {
  return {
    id,
    hostname: "*",
    ip,
    notes: `aex-managed-sandbox:${ip}`,
    action: "deny",
    ...additions,
  };
}

function fakeVercel(state, actions) {
  let nextId = 1;
  let active = state;
  return async (url, init) => {
    assert.equal(url.origin, "https://api.vercel.com");
    assert.equal(url.pathname, "/v1/security/firewall/config");
    assert.equal(url.searchParams.get("projectId"), "project");
    assert.equal(url.searchParams.get("teamId"), "team");
    assert.equal(init.headers.authorization, "Bearer token");
    const method = init.method ?? "GET";
    if (method === "GET") {
      return Response.json({ active, draft: null, versions: [] });
    }

    const operation = JSON.parse(init.body);
    if (method === "PUT") {
      actions.push({ method, body: operation });
      active = {
        firewallEnabled: operation.firewallEnabled,
        rules: operation.rules ?? [],
        ips: operation.ips ?? [],
        changes: [],
      };
      return Response.json({ active });
    }
    actions.push(operation);
    if (operation.action === "firewallEnabled") active.firewallEnabled = operation.value;
    if (operation.action === "ip.insert") {
      active.ips.push({ id: `new-${nextId++}`, ...operation.value });
    }
    if (operation.action === "ip.update") {
      const index = active.ips.findIndex((entry) => entry.id === operation.id);
      active.ips[index] = { id: operation.id, ...operation.value };
    }
    if (operation.action === "ip.remove") {
      active.ips = active.ips.filter((entry) => entry.id !== operation.id);
    }
    return Response.json({});
  };
}
