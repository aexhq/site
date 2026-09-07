import { randomBytes, createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { loginReturn } from "../../../../lib/cli-login";
import { secret, siteOrigin } from "../../../../lib/control";
export async function GET(request: NextRequest) {
  let returnTo: string;
  try { returnTo = loginReturn(request.nextUrl.searchParams.get("returnTo")); }
  catch { return NextResponse.json({ message: "Invalid login return path" }, { status: 400 }); }
  const state = randomBytes(32).toString("base64url"), nonce = randomBytes(32).toString("base64url"), verifier = randomBytes(32).toString("base64url");
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.search = new URLSearchParams({ client_id: secret("AEX_OAUTH_GOOGLE_CLIENT_ID"), redirect_uri: `${siteOrigin()}/api/auth/callback/google`, response_type: "code",
    scope: "openid email", state, nonce, code_challenge_method: "S256", code_challenge: createHash("sha256").update(verifier).digest("base64url") }).toString();
  const response = NextResponse.redirect(url);
  response.headers.set("cache-control", "no-store");
  response.cookies.set("aex_login", JSON.stringify({ state, nonce, verifier, returnTo }), { httpOnly: true, secure: true, sameSite: "lax", path: "/api/auth", maxAge: 600 });
  return response;
}
