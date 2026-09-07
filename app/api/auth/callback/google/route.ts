import { NextRequest, NextResponse } from "next/server";
import { createRemoteJWKSet, jwtVerify } from "jose";
import { loginReturn } from "../../../../../lib/cli-login";
import { accountCookie, controlOrigin, secret, siteOrigin } from "../../../../../lib/control";
const jwks = createRemoteJWKSet(new URL("https://www.googleapis.com/oauth2/v3/certs"));
export async function GET(request: NextRequest) {
  const response = NextResponse.redirect(`${siteOrigin()}/dashboard`);
  response.headers.set("cache-control", "no-store");
  response.cookies.set("aex_login", "", { path: "/api/auth", maxAge: 0 });
  try {
    const login = JSON.parse(request.cookies.get("aex_login")?.value ?? "null");
    const code = request.nextUrl.searchParams.get("code");
    if (!login || !code || login.state !== request.nextUrl.searchParams.get("state")) throw new Error("invalid login state");
    const tokens = await fetch("https://oauth2.googleapis.com/token", { method: "POST", redirect: "error", signal: AbortSignal.timeout(15_000),
      body: new URLSearchParams({ client_id: secret("AEX_OAUTH_GOOGLE_CLIENT_ID"), client_secret: secret("AEX_OAUTH_GOOGLE_CLIENT_SECRET"), code, grant_type: "authorization_code", code_verifier: login.verifier, redirect_uri: `${siteOrigin()}/api/auth/callback/google` }) });
    if (!tokens.ok) throw new Error("identity exchange failed");
    const { id_token } = await tokens.json();
    const { payload } = await jwtVerify(id_token, jwks, { issuer: ["https://accounts.google.com", "accounts.google.com"], audience: secret("AEX_OAUTH_GOOGLE_CLIENT_ID"), algorithms: ["RS256"], requiredClaims: ["exp", "iat", "sub", "nonce"] });
    if (payload.nonce !== login.nonce || payload.email_verified !== true || typeof payload.email !== "string") throw new Error("unverified identity");
    const upstream = await fetch(`${controlOrigin()}/v1/accounts`, { method: "POST", redirect: "error", signal: AbortSignal.timeout(15_000), headers: { authorization: `Bearer ${secret("AEX_SITE_TOKEN")}`, "content-type": "application/json" }, body: JSON.stringify({ subject: `google:${payload.sub}`, email: payload.email }), cache: "no-store" });
    if (!upstream.ok) throw new Error("account unavailable");
    const session = await upstream.json();
    if (typeof session.token !== "string" || !session.token.startsWith("aex_account_") || !Number.isSafeInteger(session.expires)) throw new Error("invalid account session");
    response.cookies.set(accountCookie, session.token, { httpOnly: true, secure: true, sameSite: "lax", path: "/", expires: new Date(session.expires * 1000) });
    response.headers.set("location", `${siteOrigin()}${loginReturn(login.returnTo)}`);
    return response;
  } catch {
    response.headers.set("location", `${siteOrigin()}/dashboard?error=signin`);
    return response;
  }
}
