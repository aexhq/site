"use client";
import { useState } from "react";
export function Authorize({ input }: { input: { redirect_uri: string; code_challenge: string; state: string } }) {
  const [busy, setBusy] = useState(false), [error, setError] = useState("");
  async function authorize() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/control/auth/grants", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ code_challenge: input.code_challenge, redirect_uri: input.redirect_uri }), redirect: "error" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "CLI authorization failed. Run aex login again.");
      const callback = new URL(input.redirect_uri);
      callback.search = new URLSearchParams({ code: result.code, state: input.state }).toString();
      window.location.assign(callback.toString());
    } catch (error) { setError((error as Error).message); setBusy(false); }
  }
  return <><button className="button" type="button" disabled={busy} onClick={() => void authorize()}>Authorize CLI</button>{error && <p role="alert">{error}</p>}</>;
}
