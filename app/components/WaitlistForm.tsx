"use client";

import { FormEvent, useState } from "react";

type ErrorBody = { error?: { message?: string } };

export function WaitlistForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "received">("idle");
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("sending");
    setError("");
    try {
      const response = await fetch("/api/control/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const body = (await response.json().catch(() => null)) as ErrorBody | null;
      if (!response.ok) {
        throw new Error(body?.error?.message ?? "We could not add you just now.");
      }
      setState("received");
    } catch (reason) {
      setState("idle");
      setError(reason instanceof Error ? reason.message : "We could not add you just now.");
    }
  }

  if (state === "received") {
    return (
      <div className={compact ? "waitlist-success waitlist-success-compact" : "waitlist-success"}>
        <span aria-hidden="true">✓</span>
        <p>
          You’re on the list.
          <small>We’ll email {email.trim()} when an alpha place is ready.</small>
        </p>
      </div>
    );
  }

  return (
    <form className={compact ? "waitlist-form waitlist-form-compact" : "waitlist-form"} onSubmit={submit}>
      <label className="sr-only" htmlFor={compact ? "alpha-email-compact" : "alpha-email"}>
        Email
      </label>
      <input
        autoComplete="email"
        id={compact ? "alpha-email-compact" : "alpha-email"}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@example.com"
        required
        type="email"
        value={email}
      />
      <button className="button button-primary" disabled={state === "sending"} type="submit">
        {state === "sending" ? "Joining…" : "Join the alpha"}
        <span aria-hidden="true">→</span>
      </button>
      <p className="waitlist-note">
        No marketing email. See our <a href="/privacy">privacy notice</a>.
      </p>
      <p className="form-error" aria-live="polite">
        {error}
      </p>
    </form>
  );
}
