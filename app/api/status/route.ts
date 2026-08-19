import { NextResponse } from "next/server";

const API_HEALTH_URL = "https://api.aex.dev/v1/rates";

export async function GET() {
  const started = Date.now();
  try {
    const response = await fetch(API_HEALTH_URL, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: AbortSignal.timeout(8_000),
    });
    return NextResponse.json(
      {
        checked_at: new Date().toISOString(),
        service: "Aex API",
        status: response.ok ? "operational" : "unavailable",
        response_ms: Date.now() - started,
      },
      { headers: { "cache-control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      {
        checked_at: new Date().toISOString(),
        service: "Aex API",
        status: "unavailable",
        response_ms: Date.now() - started,
      },
      { headers: { "cache-control": "no-store" } },
    );
  }
}
