"use client";

import { useCallback, useEffect, useState } from "react";

type Health = {
  checked_at: string;
  service: string;
  status: "operational" | "unavailable";
  response_ms: number;
};

export function StatusClient() {
  const [health, setHealth] = useState<Health | null>(null);

  const check = useCallback(async () => {
    try {
      const response = await fetch("/api/status", { cache: "no-store" });
      setHealth(await response.json() as Health);
    } catch {
      setHealth({
        checked_at: new Date().toISOString(),
        service: "AEX API",
        status: "unavailable",
        response_ms: 0,
      });
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void check(), 0);
    const timer = window.setInterval(() => void check(), 60_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [check]);

  const apiState = health?.status ?? "checking";
  return (
    <>
      <dl className="status-list">
        <div>
          <dt><i className="status-dot status-dot-good" /> Website</dt>
          <dd>Operational</dd>
        </div>
        <div>
          <dt>
            <i className={`status-dot status-dot-${apiState}`} /> AEX API
          </dt>
          <dd>{apiState === "checking" ? "Checking…" : apiState === "operational" ? "Operational" : "Unavailable"}</dd>
        </div>
      </dl>
      <p className="site-small status-checked" aria-live="polite">
        {health
          ? `Checked ${new Date(health.checked_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · ${health.response_ms} ms`
          : "Checking the production API…"}
      </p>
    </>
  );
}
