export const accountCookie = "aex_account";
export function controlOrigin() {
  const url = new URL(process.env.AEX_API_BASE_URL ?? "https://api.aex.dev");
  if ((url.protocol !== "https:" && !(url.protocol === "http:" && ["127.0.0.1", "localhost"].includes(url.hostname))) || url.username || url.password || url.pathname !== "/" || url.search || url.hash) throw new Error("AEX_API_BASE_URL must be an HTTPS origin");
  return url.origin;
}
export function siteOrigin() { return new URL(process.env.AEX_SITE_ORIGIN ?? "https://aex.dev").origin; }
export function secret(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required`);
  return value;
}
