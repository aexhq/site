"use client";

import { FormEvent, useCallback, useMemo, useState } from "react";

type Account = {
  id: string;
  email: string;
  created_at: string;
  limits: {
    max_concurrent_sessions: number;
    session_creates_per_hour: number;
  };
};

type Balance = {
  microusd: number;
  usd: string;
  metered_to: string;
};

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  created_at: string;
  last_used_at?: string;
  revoked_at?: string;
};

type UsageLine = {
  session_id: string;
  shape: string;
  state: string;
  running_ms: number;
  compute_microusd: number;
  storage_microusd: number;
  web_search_queries: number;
  web_search_microusd: number;
  total_microusd: number;
  storage: {
    workspace_bytes: number;
    suspended_bytes: number;
    artifact_bytes: number;
  };
  metered_to: string;
};

type Usage = {
  total_microusd: number;
  balance_microusd: number;
  sessions: UsageLine[];
  metered_to: string;
  rates: {
    vcpu_hour_microusd: number;
    gb_hour_microusd: number;
    suspended_gb_month_microusd: number;
    workspace_gb_month_microusd: number;
    web_search_query_microusd: number;
  };
};

type DashboardData = {
  account: Account;
  balance: Balance;
  usage: Usage;
  keys: ApiKey[];
};

async function getJson<T>(path: string, token: string): Promise<T> {
  const response = await fetch("/api/control/" + path, {
    headers: { authorization: "Bearer " + token },
    cache: "no-store",
  });
  const body = (await response.json().catch(() => null)) as
    | { error?: { message?: string } }
    | null;
  if (!response.ok) {
    throw new Error(
      body?.error?.message ?? "The control plane returned " + response.status + ".",
    );
  }
  return body as T;
}

function money(microusd: number, digits = 6) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: digits,
  }).format(microusd / 1_000_000);
}

function duration(ms: number) {
  if (ms < 1_000) return ms + " ms";
  if (ms < 60_000) return (ms / 1_000).toFixed(1) + " s";
  const minutes = Math.floor(ms / 60_000);
  return minutes + "m " + Math.floor((ms % 60_000) / 1_000) + "s";
}

function bytes(value: number) {
  if (value === 0) return "0 B";
  const units = ["B", "KiB", "MiB", "GiB"];
  const index = Math.min(Math.floor(Math.log(value) / Math.log(1024)), units.length - 1);
  return (value / 1024 ** index).toFixed(index === 0 ? 0 : 1) + " " + units[index];
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

export function DashboardClient() {
  const [token, setToken] = useState("");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (nextToken: string) => {
    setLoading(true);
    setError("");
    try {
      const [account, balance, usage, keys] = await Promise.all([
        getJson<Account>("account", nextToken),
        getJson<Balance>("balance", nextToken),
        getJson<Usage>("usage", nextToken),
        getJson<{ data: ApiKey[] }>("keys", nextToken),
      ]);
      setData({ account, balance, usage, keys: keys.data });
    } catch (reason) {
      setData(null);
      setError(reason instanceof Error ? reason.message : "Could not load the account.");
    } finally {
      setLoading(false);
    }
  }, []);

  function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clean = token.trim();
    if (!clean.startsWith("aex_at_")) {
      setError("Use the account token beginning with aex_at_, not a session API key.");
      return;
    }
    void load(clean);
  }

  function disconnect() {
    setToken("");
    setData(null);
    setError("");
  }

  const sessions = useMemo(
    () => [...(data?.usage.sessions ?? [])].sort((a, b) => b.total_microusd - a.total_microusd),
    [data],
  );
  const activeSessions = sessions.filter((session) => session.state !== "deleted").length;
  const searchQueries = sessions.reduce((total, session) => total + session.web_search_queries, 0);
  const liveKeys = data?.keys.filter((key) => !key.revoked_at) ?? [];

  if (!data) {
    return (
      <section className="dashboard-connect shell" aria-labelledby="dashboard-title">
        <div className="dashboard-intro">
          <p className="section-index">DASHBOARD / LIVE CONTROL PLANE</p>
          <h1 id="dashboard-title">The bill is a fold, not a guess.</h1>
          <p>
            Connect with your account token to read the current balance, every
            rated session line, and API-key activity from the control plane.
          </p>
          <div className="dashboard-assurances">
            <div>
              <span>01</span>
              <p>Read-only dashboard</p>
            </div>
            <div>
              <span>02</span>
              <p>Token kept in memory only</p>
            </div>
            <div>
              <span>03</span>
              <p>Exact integer micro-USD</p>
            </div>
          </div>
        </div>

        <form className="token-panel" onSubmit={connect}>
          <div className="token-panel-head">
            <span className="pulse-dot" aria-hidden="true" />
            api.aex.dev
          </div>
          <label htmlFor="account-token">Account token</label>
          <input
            id="account-token"
            autoComplete="off"
            onChange={(event) => setToken(event.target.value)}
            placeholder="aex_at_••••••••••••••••"
            spellCheck={false}
            type="password"
            value={token}
          />
          <button className="button button-primary token-submit" disabled={loading} type="submit">
            {loading ? "Connecting…" : "Connect account"}
            <span aria-hidden="true">→</span>
          </button>
          <p className="token-note">
            Your token is sent through this site only to the fixed aex control-plane origin.
            It is never written to browser storage.
          </p>
          <div className="form-error" aria-live="polite">
            {error}
          </div>
        </form>
      </section>
    );
  }

  return (
    <section className="dashboard shell" aria-labelledby="account-title">
      <div className="dashboard-topline">
        <div>
          <p className="section-index">ACCOUNT / LIVE METER</p>
          <h1 id="account-title">{data.account.email}</h1>
          <p>
            Metered to {when(data.balance.metered_to)} · {data.account.id}
          </p>
        </div>
        <div className="dashboard-actions">
          <button className="button button-quiet" disabled={loading} onClick={() => void load(token)}>
            {loading ? "Refreshing…" : "Refresh"}
          </button>
          <button className="button button-outline-light" onClick={disconnect}>
            Disconnect
          </button>
        </div>
      </div>

      <div className="dashboard-metrics">
        <article className="metric-primary">
          <span>Prepaid balance</span>
          <strong>{"$"}{data.balance.usd}</strong>
          <small>{data.balance.microusd.toLocaleString()} µUSD available</small>
        </article>
        <article>
          <span>Total rated usage</span>
          <strong>{money(data.usage.total_microusd)}</strong>
          <small>{data.usage.total_microusd.toLocaleString()} µUSD</small>
        </article>
        <article>
          <span>Session lines</span>
          <strong>{sessions.length}</strong>
          <small>{activeSessions} live · {searchQueries} searches</small>
        </article>
        <article>
          <span>Live API keys</span>
          <strong>{liveKeys.length}</strong>
          <small>{data.keys.length - liveKeys.length} revoked</small>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="dashboard-card session-card">
          <header>
            <div>
              <span>RATED LEDGER</span>
              <h2>Sessions</h2>
            </div>
            <span>{sessions.length} total</span>
          </header>
          {sessions.length === 0 ? (
            <div className="empty-state">No session usage has been rated yet.</div>
          ) : (
            <div className="session-table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Session</th>
                    <th>State</th>
                    <th>Runtime</th>
                    <th>Workspace</th>
                    <th>Search</th>
                    <th>Cost</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.session_id}>
                      <td>
                        <code>{session.session_id}</code>
                        <small>{session.shape} hand</small>
                      </td>
                      <td>
                        <span className={"state state-" + session.state}>{session.state}</span>
                      </td>
                      <td>{duration(session.running_ms)}</td>
                      <td>{bytes(session.storage.workspace_bytes + session.storage.artifact_bytes)}</td>
                      <td>
                        {session.web_search_queries}
                        <small>{money(session.web_search_microusd)}</small>
                      </td>
                      <td>
                        <strong>{money(session.total_microusd)}</strong>
                        <small>
                          {money(session.compute_microusd)} compute · {money(session.storage_microusd)} storage
                        </small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="dashboard-card keys-card">
          <header>
            <div>
              <span>IDENTITY</span>
              <h2>API keys</h2>
            </div>
          </header>
          <div className="key-list">
            {data.keys.length === 0 ? (
              <div className="empty-state">No API keys yet.</div>
            ) : (
              data.keys.map((key) => (
                <div className={key.revoked_at ? "key-row key-revoked" : "key-row"} key={key.id}>
                  <div>
                    <strong>{key.name}</strong>
                    <code>{key.prefix}••••</code>
                  </div>
                  <div>
                    <span>{key.revoked_at ? "Revoked" : "Active"}</span>
                    <small>Last used: {when(key.last_used_at)}</small>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="limit-block">
            <p>Account limits</p>
            <div>
              <span>Concurrent sessions</span>
              <strong>{data.account.limits.max_concurrent_sessions}</strong>
            </div>
            <div>
              <span>Creates / hour</span>
              <strong>{data.account.limits.session_creates_per_hour}</strong>
            </div>
          </div>
        </article>
      </div>

      <div className="rate-line">
        <span>ACTIVE RATE CARD</span>
        <p>
          vCPU-hour <strong>{money(data.usage.rates.vcpu_hour_microusd, 4)}</strong>
        </p>
        <p>
          GB-hour <strong>{money(data.usage.rates.gb_hour_microusd, 6)}</strong>
        </p>
        <p>
          Workspace GB-month <strong>{money(data.usage.rates.workspace_gb_month_microusd, 4)}</strong>
        </p>
        <p>
          Web search <strong>{money(data.usage.rates.web_search_query_microusd, 4)} / query</strong>
        </p>
        <a href="https://api.aex.dev/v1/rates" rel="noreferrer" target="_blank">
          JSON <span aria-hidden="true">↗</span>
        </a>
      </div>
      <div className="form-error dashboard-error" aria-live="polite">
        {error}
      </div>
    </section>
  );
}
