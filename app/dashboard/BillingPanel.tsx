"use client";
import { FormEvent, useCallback, useEffect, useState } from "react";
import type { LedgerPage, Refund, RefundInput, Topup, TopupInput, Wallet } from "@aexhq/sdk";
import { api } from "./control";
import { formatMicroUsd, parseUsd } from "./exact-format";

type Payment = { key: string } & ({ kind: "topups"; input: TopupInput } | { kind: "refunds"; input: RefundInput });
const money = (amount: number) => formatMicroUsd(String(amount), 6);
const date = (seconds: number) => new Date(seconds * 1000).toLocaleString();
const units: Record<string, [number, string]> = {
  turn_ms: [1000, "Active turn / second"], sandbox_ms: [60000, "Sandbox / minute (1 core, 1 GiB)"],
  attachment_byte_secs: [1073741824 * 86400, "Attachment storage / GiB-day"], egress_bytes: [1073741824, "Attachment reads / GiB"],
};

export function BillingPanel({ accountId }: { accountId: string }) {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [topups, setTopups] = useState<Topup[]>([]);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [ledger, setLedger] = useState<LedgerPage>({ entries: [] });
  const [limit, setLimit] = useState("");
  const [accepted, setAccepted] = useState(false);
  const [amount, setAmount] = useState("");
  const [refundTopup, setRefundTopup] = useState("");
  const [refundAmount, setRefundAmount] = useState("");
  const [pending, setPending] = useState<Payment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const storageKey = `aex-payment-v1:${accountId}`;
  const load = useCallback(async () => {
    const [wallet, topups, refunds, ledger] = await Promise.all([
      api<Wallet>("billing"), api<Topup[]>("billing/topups"), api<Refund[]>("billing/refunds"), api<LedgerPage>("billing/ledger"),
    ]);
    setWallet(wallet); setTopups(topups); setRefunds(refunds); setLedger(ledger);
    setLimit(wallet.spend_limit_micro_usd == null ? "" : String(wallet.spend_limit_micro_usd / 1_000_000));
    setAmount(wallet.topup_amounts_cents[0]?.toString() ?? "");
    const saved = localStorage.getItem(storageKey);
    setPending(saved ? JSON.parse(saved) : null);
  }, [storageKey]);
  useEffect(() => {
    const timer = setTimeout(() => void load().catch(error => setError(error.message)), 0);
    return () => clearTimeout(timer);
  }, [load]);
  async function action(run: () => Promise<void>) {
    setBusy(true); setError(""); setNotice("");
    try { await run(); } catch (error) { setError((error as Error).message); } finally { setBusy(false); }
  }
  async function pay(payment: Payment) {
    // Persist before POST; a lost response or page reload must reuse the same intent.
    localStorage.setItem(storageKey, JSON.stringify(payment)); setPending(payment);
    let result: Topup | Refund;
    try { result = await api<Topup | Refund>(`billing/${payment.kind}`, "POST", payment.input, payment.key); }
    catch (error) {
      const status = (error as { status?: number }).status;
      if (status && status >= 400 && status < 500) { localStorage.removeItem(storageKey); setPending(null); }
      await load(); throw error;
    }
    localStorage.removeItem(storageKey); setPending(null);
    await load();
    if (payment.kind === "topups" && "checkout_url" in result && result.checkout_url && result.state === "open") {
      const url = new URL(result.checkout_url);
      if (url.protocol !== "https:" || url.hostname !== "checkout.stripe.com") throw new Error("Invalid Checkout address. Contact support.");
      window.location.assign(url.href);
    } else setNotice(`Payment status: ${result.state}. Refresh or sync its status below.`);
  }
  function save(event: FormEvent) {
    event.preventDefault();
    void action(async () => {
      await api("billing", "PUT", { pricebook: wallet!.offered_pricebook!.id, spend_limit_micro_usd: parseUsd(limit) });
      setAccepted(false); await load(); setNotice("Billing settings saved.");
    });
  }
  const offered = wallet?.offered_pricebook;
  const needsAcceptance = wallet?.accepted_pricebook !== offered?.id;
  return <div className="billing-panel">
    <h3>Billing</h3>
    {error && <p role="alert">{error}</p>}
    {notice && <p role="status">{notice}</p>}
    {!wallet ? <p role="status">Loading billing…</p> : <>
      <p>Model usage is billed by your model provider using your own key.</p>
      {wallet.mode === "preview" && <p>Preview hosting is free. Managed compute requires prepaid credits and acceptance of the published prices.</p>}
      {wallet.payment_mode === "test" && <p className="billing-status">Test payments: use Stripe test cards. These credits are for the test payment mode.</p>}
      {wallet.suspended && <p role="alert">Billing is suspended. New spending is blocked; contact support@aex.dev.</p>}
      <dl className="usage-list billing-balances">
        <div><dt>Available credits</dt><dd>{money(wallet.available_micro_usd)}</dd></div>
        <div><dt>Balance</dt><dd>{money(wallet.balance_micro_usd)}</dd></div>
        <div><dt>Reserved for work and refunds</dt><dd>{money(wallet.reserved_micro_usd)}</dd></div>
        <div><dt>Usage charged this month (UTC)</dt><dd>{money(wallet.spent_this_month_micro_usd)}</dd></div>
      </dl>
      <p className="muted">Reserved funds remain held until the operation is settled. Spend limits include charged usage and outstanding reservations; they do not cap your model provider bill.</p>
      {offered ? <>
        <h4>Published prices · {offered.id}</h4>
        <dl className="usage-list">{Object.entries(offered.rates).map(([meter, rate]) => {
          const [quantity, label] = units[meter];
          return <div key={meter}><dt>{label}</dt><dd>{formatMicroUsd(String(BigInt(rate.micro_usd) * BigInt(quantity) / BigInt(rate.units)), 6)}</dd></div>;
        })}</dl>
        <p className="muted">Sandbox time includes waiting between tools. Displayed unit prices are rounded down to micro-USD; settlement rounds cumulative usage once. Storage and reads are charged only for Aex attachments. Prices for active reservations remain fixed.</p>
        {needsAcceptance && wallet.accepted_pricebook && <p>Your current pricebook is {wallet.accepted_pricebook}. Accepting this offer changes the pricebook for new work.</p>}
        <form onSubmit={save} className="billing-form">
          <label htmlFor="spend-limit">Monthly spend limit (USD)</label>
          <input id="spend-limit" inputMode="decimal" value={limit} onChange={event => setLimit(event.target.value)} placeholder="0.00" required />
          {needsAcceptance && <label className="billing-consent"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} required />I accept pricebook {offered.id} and prepaid metered hosting.</label>}
          <button disabled={busy || (needsAcceptance && !accepted)}>{needsAcceptance ? "Accept prices and enable prepaid" : "Save spend limit"}</button>
        </form>
      </> : <p>Prepaid enrollment is not currently available.</p>}
      <h4>Top up credits</h4>
      {pending && <div className="billing-status"><p>A previous {pending.kind === "topups" ? "topup" : "refund"} request for {money(pending.input.amount_cents * 10000)} is awaiting a response. Retry that request to recover its status.</p><button disabled={busy} onClick={() => void action(() => pay(pending))}>Retry original request</button></div>}
      {wallet.payment_mode ? <form className="billing-form" onSubmit={event => { event.preventDefault(); void action(() => pay({ kind: "topups", input: { amount_cents: Number(amount) }, key: crypto.randomUUID() })); }}>
        <label htmlFor="topup-amount">Amount</label><select id="topup-amount" value={amount} onChange={event => setAmount(event.target.value)} required>{wallet.topup_amounts_cents.map(cents => <option key={cents} value={cents}>{money(cents * 10000)}</option>)}</select>
        <button disabled={busy || !!pending || wallet.mode !== "prepaid" || wallet.suspended}>Continue to Stripe Checkout</button>
        <p className="muted">Manual topups only. Your balance updates after Stripe confirms payment.</p>
      </form> : <p>Checkout is not currently available.</p>}
      <h4>Payments and receipts</h4>
      {topups.length ? <div className="billing-table"><table><thead><tr><th>Date</th><th>Amount</th><th>Status</th><th>Actions</th></tr></thead><tbody>{topups.map(payment => <tr key={payment.id}>
        <td>{date(payment.created)}<details><summary>Reference</summary><code>{payment.id}</code></details></td><td>{money(payment.amount_cents * 10000)}{payment.refunded_cents > 0 && <small>{money(payment.refunded_cents * 10000)} refunded</small>}</td><td>{payment.state}</td>
        <td>{payment.checkout_url && payment.state === "open" && <a href={payment.checkout_url} rel="noreferrer">Continue payment</a>}{payment.receipt_url && <a href={payment.receipt_url} target="_blank" rel="noreferrer">Receipt</a>}<button disabled={busy} onClick={() => void action(async () => { await api("billing/sync", "POST", { kind: "topup", id: payment.id }); await load(); })}>Sync status</button></td>
      </tr>)}</tbody></table></div> : <p>No payments yet.</p>}
      <h4>Refund unused credits</h4>
      <p>Refunds return to the original payment method and cannot exceed your available credits or the original payment. Pending refunds reserve that amount.</p>
      {wallet.payment_mode && <form className="billing-form" onSubmit={event => { event.preventDefault(); void action(() => pay({ kind: "refunds", input: { topup: refundTopup, amount_cents: parseUsd(refundAmount) / 10000 }, key: crypto.randomUUID() })); }}>
        <label htmlFor="refund-payment">Original payment</label><select id="refund-payment" value={refundTopup} onChange={event => setRefundTopup(event.target.value)} required><option value="">Choose a payment</option>{topups.filter(payment => payment.state === "paid" && payment.refunded_cents < payment.amount_cents).map(payment => <option key={payment.id} value={payment.id}>{date(payment.created)} · {money((payment.amount_cents - payment.refunded_cents) * 10000)} remaining</option>)}</select>
        <label htmlFor="refund-amount">Refund amount (USD)</label><input id="refund-amount" inputMode="decimal" value={refundAmount} onChange={event => setRefundAmount(event.target.value)} required />
        <button disabled={busy || !!pending || wallet.suspended || wallet.available_micro_usd < 10000}>Request refund</button>
      </form>}
      {refunds.length > 0 && <ul className="billing-refunds">{refunds.map(refund => <li key={refund.id}>{date(refund.created)} · {money(refund.amount_cents * 10000)} · {refund.state} <button disabled={busy} onClick={() => void action(async () => { await api("billing/sync", "POST", { kind: "refund", id: refund.id }); await load(); })}>Sync status</button><details><summary>Reference</summary><code>{refund.id}</code></details></li>)}</ul>}
      <h4>Credit activity</h4>
      {ledger.entries.length ? <div className="billing-table"><table><thead><tr><th>Date</th><th>Activity</th><th>Balance change</th></tr></thead><tbody>{ledger.entries.map(entry => <tr key={entry.id}><td>{date(entry.created)}</td><td>{entry.description}<small>{entry.kind}</small></td><td>{money(entry.delta_micro_usd)}</td></tr>)}</tbody></table></div> : <p>No credit activity yet.</p>}
      {ledger.next_before != null && <button disabled={busy} onClick={() => void action(async () => { const page = await api<LedgerPage>(`billing/ledger?before=${ledger.next_before}`); setLedger({ entries: [...ledger.entries, ...page.entries], next_before: page.next_before }); })}>Load older activity</button>}
      <button disabled={busy} onClick={() => void action(load)}>Refresh billing</button>
    </>}
  </div>;
}
