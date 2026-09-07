export function cliRequest(params: URLSearchParams) {
  const redirect_uri = params.get("redirect_uri") ?? "", code_challenge = params.get("code_challenge") ?? "", state = params.get("state") ?? "";
  const redirect = new URL(redirect_uri);
  if (redirect.protocol !== "http:" || redirect.hostname !== "127.0.0.1" || !redirect.port || redirect.pathname !== "/callback" || redirect.username || redirect.password || redirect.search || redirect.hash || !/^[A-Za-z0-9_-]{43}$/.test(code_challenge) || !/^[A-Za-z0-9_-]{43}$/.test(state)) throw new Error("Invalid CLI login request");
  return { redirect_uri, code_challenge, state };
}

export function loginReturn(value: string | null) {
  if (!value) return "/dashboard";
  const url = new URL(value, "https://aex.dev");
  if (url.origin !== "https://aex.dev" || url.pathname !== "/cli" || url.hash) throw new Error("Invalid login return path");
  return `/cli?${new URLSearchParams(cliRequest(url.searchParams))}`;
}
