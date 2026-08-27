"use client";

import Link from "next/link";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { WaitlistForm } from "../components/WaitlistForm";
import { compareMicroUsdDescending, formatMicroUsd } from "./exact-format.js";

type Account = {
  id: string;
  email: string;
  created_at: string;
  limits: { max_concurrent_sessions: number; session_creates_per_hour: number };
};

type Balance = { microusd: string; usd: string; metered_to: string };
type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at?: string;
  revoked_at?: string;
};
type Topup = {
  id: string;
  amount_cents: number;
  status: "pending" | "paid" | "expired";
  checkout_url?: string;
  created_at: string;
  paid_at?: string;
};
type UsageLine = {
  session_id: string;
  state: string;
  model_calls: number;
  input_tokens: string;
  output_tokens: string;
  model_microusd: string;
  total_microusd: string;
};
type Usage = {
  total_microusd: string;
  sessions: UsageLine[];
  metered_to: string;
};
type DashboardData = {
  account: Account;
  balance: Balance;
  usage: Usage;
  keys: ApiKey[];
  topups: Topup[];
};
type ApiError = { error?: { message?: string } };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch("/api/control/" + path, {
    ...init,
    cache: "no-store",
    headers: {
      ...(init?.body ? { "content-type": "application/json" } : {}),
      ...init?.headers,
    },
  });
  const body = (await response.json().catch(() => null)) as (T & ApiError) | null;
  if (!response.ok) {
    const error = new Error(body?.error?.message ?? "The Aex control plane returned an error.");
    Object.assign(error, { status: response.status });
    throw error;
  }
  return body as T;
}

function when(value?: string) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function DashboardClient({
  hasDashboardSession = false,
  initialMode = "waitlist",
}: {
  hasDashboardSession?: boolean;
  initialMode?: "waitlist" | "invite";
}) {
  const [status, setStatus] = useState<"checking" | "signed_out" | "signed_in">(
    hasDashboardSession ? "checking" : "signed_out",
  );
  const [mode, setMode] = useState<"waitlist" | "invite" | "reconnect">(initialMode);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [inviteToken, setInviteToken] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [connectToken, setConnectToken] = useState("");
  const [keyName, setKeyName] = useState("first-agent");
  const [topupDollars, setTopupDollars] = useState("10");
  const [oneTimeSecret, setOneTimeSecret] = useState<{ label: string; value: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    try {
      const account = await api<Account>("account");
      const [balance, usage, keys, topups] = await Promise.all([
        api<Balance>("balance"),
        api<Usage>("usage"),
        api<{ data: ApiKey[] }>("keys"),
        api<{ data: Topup[] }>("topups"),
      ]);
      setData({ account, balance, usage, keys: keys.data, topups: topups.data });
      setStatus("signed_in");
      setError("");
    } catch (reason) {
      const responseStatus = (reason as Error & { status?: number }).status;
      if (responseStatus === 401) {
        setData(null);
        setStatus("signed_out");
        return;
      }
      setError(reason instanceof Error ? reason.message : "Could not load this account.");
      setStatus((current) => current === "checking" ? "signed_out" : current);
    }
  }, []);

  useEffect(() => {
    if (!hasDashboardSession) return;
    const timer = window.setTimeout(() => void load(), 0);
    return () => window.clearTimeout(timer);
  }, [hasDashboardSession, load]);

  const sessions = useMemo(
    () => [...(data?.usage.sessions ?? [])].sort((a, b) =>
      compareMicroUsdDescending(a.total_microusd, b.total_microusd)),
    [data],
  );
  const liveKeys = data?.keys.filter((key) => !key.revoked_at) ?? [];

  async function acceptInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const created = await api<{ account: Account; account_token: string }>("accounts", {
        method: "POST",
        body: JSON.stringify({ email: signupEmail.trim(), invite_token: inviteToken.trim() }),
      });
      setOneTimeSecret({ label: "Account recovery token", value: created.account_token });
      setInviteToken("");
      setAcceptedTerms(false);
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the account.");
    } finally {
      setLoading(false);
    }
  }

  async function reconnect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api<Account>("session", {
        method: "POST",
        body: JSON.stringify({ account_token: connectToken.trim() }),
      });
      setConnectToken("");
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not connect this account.");
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await api("session", { method: "DELETE" });
    setOneTimeSecret(null);
    setData(null);
    setStatus("signed_out");
  }

  async function createKey(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const created = await api<{ secret: string }>("keys", {
        method: "POST",
        body: JSON.stringify({ name: keyName.trim() }),
      });
      setOneTimeSecret({ label: "Session API key", value: created.secret });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not create the API key.");
    } finally {
      setLoading(false);
    }
  }

  async function revokeKey(keyId: string) {
    setLoading(true);
    setError("");
    try {
      await fetch("/api/control/keys/" + encodeURIComponent(keyId), {
        method: "DELETE",
        cache: "no-store",
      }).then((response) => {
        if (!response.ok) throw new Error("Could not revoke the API key.");
      });
      await load();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not revoke the API key.");
    } finally {
      setLoading(false);
    }
  }

  async function startTopup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dollars = Number(topupDollars);
    if (!Number.isInteger(dollars) || dollars < 10 || dollars > 1_000) {
      setError("Choose a whole-dollar top-up between $10 and $1,000.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const topup = await api<Topup>("topups", {
        method: "POST",
        body: JSON.stringify({ amount_cents: dollars * 100 }),
        // Required by the control plane: a retried create replays the same topup and
        // checkout link instead of minting a second live payment.
        headers: { "idempotency-key": crypto.randomUUID() },
      });
      if (!topup.checkout_url) throw new Error("Checkout did not return a payment URL.");
      window.location.assign(topup.checkout_url);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not start checkout.");
      setLoading(false);
    }
  }

  async function copySecret() {
    if (!oneTimeSecret) return;
    await navigator.clipboard.writeText(oneTimeSecret.value);
    setCopied(true);
  }

  if (status === "checking") {
    return (
      <section
        aria-busy="true"
        aria-labelledby="dashboard-loading-title"
        className="dashboard-loading shell"
        role="status"
      >
        <span className="dashboard-spinner" aria-hidden="true" />
        <div>
          <p className="section-index">Account · Alpha</p>
          <h1 id="dashboard-loading-title">Opening your dashboard.</h1>
          <p>Checking your secure dashboard session…</p>
        </div>
      </section>
    );
  }

  if (status === "signed_out" || !data) {
    return (
      <section className="onboarding shell" aria-labelledby="dashboard-title">
        <div className="onboarding-copy">
          <p className="section-index">Aex · Alpha</p>
          <h1 id="dashboard-title">Start in the dashboard.</h1>
          <p>
            Join the waitlist, accept an invitation, and create your first API key here.
            Then use the SDK or CLI from your application.
          </p>
        </div>
        <div className="onboarding-panel">
          <div className="mode-tabs" role="tablist" aria-label="Onboarding step">
            <button aria-selected={mode === "waitlist"} onClick={() => setMode("waitlist")} role="tab">
              Join waitlist
            </button>
            <button aria-selected={mode === "invite"} onClick={() => setMode("invite")} role="tab">
              Use invitation
            </button>
            <button aria-selected={mode === "reconnect"} onClick={() => setMode("reconnect")} role="tab">
              Reconnect
            </button>
          </div>

          {mode === "waitlist" ? (
            <div className="onboarding-form-wrap">
              <span className="step-label">Request access</span>
              <h2>Join the alpha.</h2>
              <p>We are admitting a small number of developers while the product is still hands-on.</p>
              <WaitlistForm compact />
            </div>
          ) : null}

          {mode === "invite" ? (
            <form className="onboarding-form" onSubmit={acceptInvitation}>
              <span className="step-label">Accept invitation</span>
              <h2>Create your account.</h2>
              <label htmlFor="signup-email">Invited email</label>
              <input
                autoComplete="email"
                id="signup-email"
                onChange={(event) => setSignupEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={signupEmail}
              />
              <label htmlFor="invite-token">One-time invitation</label>
              <input
                autoComplete="off"
                id="invite-token"
                onChange={(event) => setInviteToken(event.target.value)}
                placeholder="aex_iv_••••••••••••"
                required
                spellCheck={false}
                type="password"
                value={inviteToken}
              />
              <label className="terms-check">
                <input
                  checked={acceptedTerms}
                  onChange={(event) => setAcceptedTerms(event.target.checked)}
                  required
                  type="checkbox"
                />
                <span>
                  I agree to the <a href="/terms" target="_blank">Alpha terms</a>.
                </span>
              </label>
              <button className="button button-primary" disabled={loading} type="submit">
                {loading ? "Creating…" : "Create account"} <span aria-hidden="true">→</span>
              </button>
            </form>
          ) : null}

          {mode === "reconnect" ? (
            <form className="onboarding-form" onSubmit={reconnect}>
              <span className="step-label">Returning account</span>
              <h2>Reconnect securely.</h2>
              <label htmlFor="account-token">Account recovery token</label>
              <input
                autoComplete="off"
                id="account-token"
                onChange={(event) => setConnectToken(event.target.value)}
                placeholder="aex_at_••••••••••••"
                required
                spellCheck={false}
                type="password"
                value={connectToken}
              />
              <button className="button button-primary" disabled={loading} type="submit">
                {loading ? "Connecting…" : "Open account"} <span aria-hidden="true">→</span>
              </button>
              <p className="security-note">
                The site exchanges this once for an HttpOnly, Secure dashboard cookie. Browser
                scripts cannot read it, and it is never written to web storage.
              </p>
            </form>
          ) : null}
          <p className="form-error onboarding-error" aria-live="polite">{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="dashboard shell" aria-labelledby="account-title">
      <div className="dashboard-topline">
        <div>
          <p className="section-index">Account · Alpha</p>
          <h1 id="account-title">{data.account.email}</h1>
          <p>{data.account.id} · metered {when(data.balance.metered_to)}</p>
        </div>
        <div className="dashboard-actions">
          <button className="button button-quiet" disabled={loading} onClick={() => void load()}>
            Refresh
          </button>
          <button className="button button-outline-light" onClick={() => void signOut()}>
            Sign out
          </button>
        </div>
      </div>

      {oneTimeSecret ? (
        <aside className="one-time-secret" aria-live="polite">
          <div>
            <span>{oneTimeSecret.label} · shown once</span>
            <code>{oneTimeSecret.value}</code>
            <p>Save this in a password manager. Aex stores only its hash and cannot show it again.</p>
          </div>
          <button className="button button-dark" onClick={() => void copySecret()}>
            {copied ? "Copied" : "Copy secret"}
          </button>
          <button className="secret-dismiss" onClick={() => setOneTimeSecret(null)} aria-label="Dismiss secret">
            ×
          </button>
        </aside>
      ) : null}

      <div className="dashboard-metrics">
        <article className="metric-primary">
          <span>Prepaid balance</span>
          <strong>${data.balance.usd}</strong>
          <small>Available credit</small>
        </article>
        <article>
          <span>Rated usage</span>
          <strong>{formatMicroUsd(data.usage.total_microusd)}</strong>
          <small>Across {sessions.length} sessions</small>
        </article>
        <article>
          <span>API keys</span>
          <strong>{liveKeys.length}</strong>
          <small>{data.keys.length - liveKeys.length} revoked</small>
        </article>
        <article>
          <span>Latest top-up</span>
          <strong>{data.topups[0] ? "$" + (data.topups[0].amount_cents / 100).toFixed(0) : "—"}</strong>
          <small>{data.topups[0]?.status ?? "No payments yet"}</small>
        </article>
      </div>

      <div className="action-grid">
        <form className="dashboard-action-card" onSubmit={startTopup}>
          <span className="step-label">Credit</span>
          <h2>Add credit.</h2>
          <p>
            Unused prepaid balance is refundable. Stripe handles the card details. Review{" "}
            <a href="/#pricing" rel="noreferrer" target="_blank">pricing</a> or the{" "}
            <a href="https://api.aex.dev/v1/rates" rel="noreferrer" target="_blank">live rate card</a> before checkout.
          </p>
          <label htmlFor="topup-dollars">Top-up amount (USD)</label>
          <div className="inline-input">
            <span>$</span>
            <input
              id="topup-dollars"
              inputMode="numeric"
              max="1000"
              min="10"
              onChange={(event) => setTopupDollars(event.target.value)}
              step="1"
              type="number"
              value={topupDollars}
            />
          </div>
          <button className="button button-primary" disabled={loading} type="submit">
            Continue to checkout <span aria-hidden="true">→</span>
          </button>
        </form>

        <form className="dashboard-action-card" onSubmit={createKey}>
          <span className="step-label">API key</span>
          <h2>Create an API key.</h2>
          <p>This key creates and continues sessions. It cannot view billing or create another key.</p>
          <label htmlFor="key-name">Key name</label>
          <input
            id="key-name"
            maxLength={128}
            onChange={(event) => setKeyName(event.target.value)}
            required
            value={keyName}
          />
          <button className="button button-primary" disabled={loading} type="submit">
            Create key <span aria-hidden="true">→</span>
          </button>
        </form>
      </div>

      <article className="dashboard-card dashboard-quickstart">
        <header>
          <div><span>Get started</span><h2>Use your key.</h2></div>
          <Link href="/brain/docs">
            Documentation
          </Link>
        </header>
        <pre><code>{`npm install @aexhq/sdk @aexhq/brain-pi

import { Aex } from "@aexhq/sdk";
import { pi } from "@aexhq/brain-pi";

const aex = new Aex({ apiKey: process.env.AEX_API_KEY! });
const session = await aex.sessions.create({
  brain: pi(),
  model: {
    provider: "vercel-ai-gateway",
    name: "openai/gpt-5.4",
    apiKey: "your-vercel-ai-gateway-key",
  },
  system: "Do the work.",
});
await session.send("Plan my day.");`}</code></pre>
      </article>

      <div className="dashboard-grid">
        <article className="dashboard-card session-card">
          <header><div><span>Usage</span><h2>Sessions</h2></div><span>{sessions.length} total</span></header>
          {sessions.length === 0 ? (
            <div className="empty-state">Your rated session lines will appear here.</div>
          ) : (
            <div className="session-table-wrap">
              <table>
                <thead><tr><th>Session</th><th>State</th><th>Model calls</th><th>Tokens in / out</th><th>Cost</th></tr></thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.session_id}>
                      <td><code>{session.session_id}</code></td>
                      <td><span className={"state state-" + session.state}>{session.state}</span></td>
                      <td>{session.model_calls}</td>
                      <td>{session.input_tokens} / {session.output_tokens}</td>
                      <td><strong>{formatMicroUsd(session.model_microusd, 6)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="dashboard-card keys-card">
          <header><div><span>Access</span><h2>API keys</h2></div></header>
          <div className="key-list">
            {data.keys.length === 0 ? <div className="empty-state">Create your first key above.</div> : null}
            {data.keys.map((key) => (
              <div className={key.revoked_at ? "key-row key-revoked" : "key-row"} key={key.id}>
                <div><strong>{key.name}</strong><code>{key.prefix}••••</code><small>Used {when(key.last_used_at)}</small></div>
                {key.revoked_at ? <span>Revoked</span> : (
                  <button disabled={loading} onClick={() => void revokeKey(key.id)} type="button">Revoke</button>
                )}
              </div>
            ))}
          </div>
        </article>
      </div>

      <p className="form-error dashboard-error" aria-live="polite">{error}</p>
    </section>
  );
}
