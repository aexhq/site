"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Topup = { status: "pending" | "paid" | "expired" };

export function TopupStatusClient() {
  const [state, setState] = useState<"checking" | "paid" | "pending" | "signed_out" | "error">("checking");

  useEffect(() => {
    let stopped = false;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let attempt = 0;
    async function check() {
      attempt += 1;
      try {
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
        if (!stopped) setState("pending");
        if (attempt < 5) timer = setTimeout(check, 1_500);
      } catch {
        if (!stopped) setState("error");
      }
    }
    void check();
    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
    };
  }, []);

  const copy = {
    checking: ["Checking the ledger…", "Stripe has returned you to AEX. We’re confirming the credit."],
    pending: ["Payment received.", "Settlement is still arriving. The dashboard will refresh it again."],
    paid: ["Credit confirmed.", "Your prepaid balance is ready for agent sessions."],
    signed_out: ["Reconnect your account.", "Your payment is safe, but this browser no longer has its dashboard session."],
    error: ["We couldn’t confirm it here.", "Open the dashboard to refresh the payment and balance."],
  }[state];

  return (
    <section className="topup-return shell">
      <p className="section-index">CHECKOUT / RETURN</p>
      <h1>{copy[0]}</h1>
      <p>{copy[1]}</p>
      <Link className="button button-primary" href="/dashboard">
        Open dashboard <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}
