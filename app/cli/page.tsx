import { cookies } from "next/headers";
import { accountCookie, controlOrigin } from "../../lib/control";
import { cliRequest } from "../../lib/cli-login";
import { Authorize } from "./Authorize";
export const dynamic = "force-dynamic";
export const metadata = { title: "Sign in to Aex CLI", robots: { index: false }, referrer: "no-referrer" };

export default async function CliLogin({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  let input;
  try {
    const params = await searchParams;
    input = cliRequest(new URLSearchParams(Object.entries(params).filter((entry): entry is [string, string] => typeof entry[1] === "string")));
  } catch { return <main className="shell"><h1>Invalid login request</h1><p>Run <code>aex login</code> in your terminal to begin.</p></main>; }
  const token = (await cookies()).get(accountCookie)?.value;
  let email: string | undefined;
  if (token) {
    const response = await fetch(`${controlOrigin()}/v1/account`, { headers: { authorization: `Bearer ${token}` }, cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15_000) });
    if (response.ok) email = (await response.json()).email;
    else if (response.status !== 401) throw new Error("Account service unavailable");
  }
  const returnTo = `/cli?${new URLSearchParams(input)}`;
  return <main className="shell"><h1>Sign in to Aex CLI</h1>{email ? <>
    <p>Continue as {email}?</p><p>This gives the CLI access to your account, API keys and usage. Continue only if you ran <code>aex login</code> on this computer.</p>
    <Authorize input={input} />
    <a href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`}>Use another Google account</a>
  </> : <><p>Sign in or register, then return to your terminal.</p><a className="button" href={`/api/auth/login?returnTo=${encodeURIComponent(returnTo)}`}>Continue with Google</a></>}</main>;
}
