"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Topup = { status: "pending" | "paid" | "expired" };
type State = "checking" | "paid" | "pending" | "expired" | "signed_out" | "error";

export function TopupStatusClient({ checkoutSessionId }: { checkoutSessionId?: string }) {
  const [state, setState] = useState<State>("checking");

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    const schedule = () => {
      if (attempt < 30) timer = setTimeout(check, 2_000);
    };
    async function check() {
      attempt += 1;
      try {
        if (checkoutSessionId !== undefined) {
          if (!/^cs_[A-Za-z0-9_]+$/.test(checkoutSessionId) || checkoutSessionId.length > 128) {
            if (!stopped) setState("error");
            return;
          }
          const response = await fetch(
            `/api/control/checkout/${encodeURIComponent(checkoutSessionId)}`,
            { cache: "no-store" },
          );
          if (response.status === 200) {
            if (!stopped) setState("paid");
            return;
          }
          if (response.status === 202) {
            if (!stopped) setState("pending");
            schedule();
            return;
          }
          if (response.status === 410) {
            if (!stopped) setState("expired");
            return;
          }
          throw new Error("Checkout return was not recognized");
        }

        // Compatibility for Checkout Sessions created before return IDs were included.
        const response = await fetch("/api/control/topups", { cache: "no-store" });
        if (response.status === 401) {
          if (!stopped) setState("signed_out");
          return;
        }
        const body = (await response.json()) as { data?: Topup[] };
        const latest = body.data?.[0];
        if (!response.ok || !latest) throw new Error("No top-up found");
        if (latest.status === "paid") {
          if (!stopped) setState("paid");
          return;
        }
        if (latest.status === "expired") {
          if (!stopped) setState("expired");
          return;
        }
        if (!stopped) setState("pending");
        schedule();
      } catch {
        if (!stopped) {
          if (attempt < 3) {
            setState("pending");
            schedule();
          } else {
            setState("error");
          }
        }
      }
    }
    void check();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, [checkoutSessionId]);

  const copy = {
    checking: ["Checking the ledger…", "Stripe has returned you to Aex. We’re confirming the credit."],
    pending: ["Still confirming payment…", "Keep this page open while Aex checks Stripe and reconciles the credit."],
    paid: ["Payment confirmed.", "Your top-up was reconciled. The dashboard has your current balance."],
    expired: ["Checkout expired.", "No credit was added. Return to the dashboard when you want to start again."],
    signed_out: ["Open your account.", "This older checkout return has no session reference, and this browser is signed out."],
    error: ["We couldn’t verify this return.", "Do not resubmit from this page. Open the dashboard to check the payment and balance."],
  }[state];

  return (
    <section className="topup-return shell">
      <p className="section-index">Checkout return</p>
      <h1>{copy[0]}</h1>
      <p>{copy[1]}</p>
      <Link className="button button-primary" href="/dashboard">
        Open dashboard <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
