"use client";
import Link from "next/link";
import { FormEvent, useCallback, useEffect, useState } from "react";
import { api } from "./control";
import { BillingPanel } from "./BillingPanel";
import type { Account, ApiKey as Key } from "@aexhq/sdk";
import { formatMicroUsd } from "./exact-format";
export function DashboardClient({ hasDashboardSession, signInError, showBilling }: { hasDashboardSession: boolean; signInError: boolean; showBilling: boolean }) {
  const [section, setSection] = useState<"keys" | "account">(showBilling ? "account" : "keys");
  const [signedIn, setSignedIn] = useState(hasDashboardSession);
  const [account, setAccount] = useState<Account | null>(null);
  const [keys, setKeys] = useState<Key[]>([]);
  const [name, setName] = useState("");
  const [editing, setEditing] = useState<Key | null>(null);
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(signInError ? "Sign-in could not complete. Please try again or contact support@aex.dev." : "");
  const load = useCallback(async () => {
    try {
      const [account, keys] = await Promise.all([api<Account>("account"), api<Key[]>("keys")]);
      setAccount(account); setKeys(keys); setSignedIn(true);
    } catch (error) {
      if ((error as { status?: number }).status === 401) setSignedIn(false);
      else setError((error as Error).message);
    }
  }, []);
  useEffect(() => {
    if (!hasDashboardSession) return;
    const timer = setTimeout(() => void load(), 0);
    return () => clearTimeout(timer);
  }, [hasDashboardSession, load]);
  async function action(run: () => Promise<void>) {
    setBusy(true); setError("");
    try { await run(); } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  function save(event: FormEvent) {
    event.preventDefault();
    void action(async () => {
      if (editing) await api(`keys/${editing.id}`, "PATCH", { name });
      else { const result = await api<{ token: string }>("keys", "POST", { name }); setSecret(result.token); }
      setName(""); setEditing(null); await load();
    });
  }
  return <div className="shell preview-dashboard">
    <h1>Dashboard</h1>
    <nav className="dashboard-nav" aria-label="Dashboard">
      <button type="button" aria-current={section === "keys" ? "page" : undefined} onClick={() => setSection("keys")}>API keys</button>
      <Link href="/docs">Docs</Link>
      <button type="button" aria-current={section === "account" ? "page" : undefined} onClick={() => setSection("account")}>Account / Billing / Usage</button>
    </nav>
    {error && <p role="alert">{error}</p>}
    {!signedIn ? <section className="dashboard-section"><h2>Get started</h2><p>Register or sign in to create your API key.</p><a className="button" href="/api/auth/login">Continue with Google</a><p className="muted">By continuing, you agree to our <Link href="/terms">Terms</Link> and <Link href="/privacy">Privacy Policy</Link>.</p></section>
      : !account ? <p role="status">Loading account…</p>
      : section === "keys" ? <section className="dashboard-section"><h2>API keys</h2>
        <form onSubmit={save} className="key-form"><label htmlFor="key-name">Key name</label><input id="key-name" value={name} onChange={event => setName(event.target.value)} maxLength={80} required placeholder="My application" /><button disabled={busy} type="submit">{editing ? "Save name" : "Create key"}</button>{editing && <button type="button" onClick={() => { setEditing(null); setName(""); }}>Cancel</button>}</form>
        {secret && <div className="new-key" role="status"><p>Copy this key now. It will only be shown once.</p><code>{secret}</code><button onClick={() => void action(async () => { await navigator.clipboard.writeText(secret); })}>Copy key</button><button onClick={() => setSecret("")}>Dismiss</button></div>}
        {keys.length ? <div className="key-list">{keys.map(key => <div className="key-row" key={key.id}><div><strong>{key.name}</strong><p className="muted"><code>{key.prefix}…</code> · {key.active ? "Active" : "Revoked"}</p></div><div>{key.active && <><button disabled={busy} onClick={() => { setEditing(key); setName(key.name); }}>Rename</button><button disabled={busy} onClick={() => void action(async () => { await api(`keys/${key.id}`, "DELETE"); await load(); })}>Revoke</button></>}</div></div>)}</div> : <p>No API keys yet.</p>}
      </section> : <section className="dashboard-section"><h2>Account / Billing / Usage</h2><p>{account.email ?? account.id}</p><p className="muted">Account: {account.id}</p><BillingPanel key={account.id} accountId={account.id} /><h3>Model usage</h3><dl className="usage-list">
        <div><dt>Reported input tokens</dt><dd>{account.usage.model.reported_input_tokens.toLocaleString()}</dd></div>
        <div><dt>Reported output tokens</dt><dd>{account.usage.model.reported_output_tokens.toLocaleString()}</dd></div>
        <div><dt>Hosting charged</dt><dd>{formatMicroUsd(String(account.usage.model.charged_micro_usd), 6)}</dd></div>
        <div><dt>Hosting absorbed by Aex</dt><dd>{formatMicroUsd(String(account.usage.model.rated_micro_usd - account.usage.model.charged_micro_usd), 6)}</dd></div>
      </dl><p className="muted">Lifetime recorded usage includes foreground and background work. {account.usage.model.unmeasured_calls} calls have incomplete usage; unknown quantities are not estimated charges.</p>
      <h3>Resource usage</h3><dl className="usage-list"><div><dt>Retained sessions</dt><dd>{account.usage.sessions} / {account.limits.sessions_per_account}</dd></div><div><dt>Active turns</dt><dd>{account.usage.active_turns} / {account.limits.active_turns_per_account}</dd></div><div><dt>Retained storage allocation</dt><dd>{(account.usage.retained_bytes / 1024 / 1024).toFixed(1)} MiB / {(account.limits.retained_bytes_per_account / 1024 / 1024 / 1024).toFixed(1)} GiB</dd></div></dl><p className="muted">Storage includes reservations for active work. {account.usage.measured_at ? `Measured ${new Date(account.usage.measured_at * 1000).toLocaleString()}.` : "Awaiting measurement."}</p><button disabled={busy} onClick={() => void action(load)}>Refresh usage</button><button disabled={busy} onClick={() => void action(async () => { await api("account/session", "DELETE"); setSignedIn(false); setAccount(null); setKeys([]); setSecret(""); })}>Sign out</button></section>}
  </div>;
}
