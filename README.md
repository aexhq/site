# Aex site

The public website and account dashboard for [Aex](https://aex.dev). It contains the product
pages, invitation flow, prepaid billing UI, API-key management, usage, legal pages, and service
status.

## Develop

Requires Node.js 22 or later.

```sh
npm ci
npm run dev
```

The site uses `https://api.aex.dev` by default. Set `AEX_API_BASE_URL` to another HTTPS control
plane when testing a different environment. Account credentials stay in an `HttpOnly`, same-site
cookie, and the same-origin proxy accepts only its explicit method and path allowlist.

## Verify

```sh
npm run lint
npm run build
npm test
```

The canonical SDK quickstart and API contracts live in
[`aexhq/aex`](https://github.com/aexhq/aex). Production deployments use the protected Vercel
workflow in `.github/workflows/deploy-vercel.yml`. Promotion also requires the exact three-entry
`managed_environment_blocked_source_ipv4_cidrs` JSON output from Platform. The workflow reconciles
those source denies across every Vercel project hostname before assigning `aex.dev`.
