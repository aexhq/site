# Aex site

The public website and account dashboard for [Aex](https://aex.dev). It contains the product
pages, Google sign-in, account and billing status, API-key management, usage, legal pages, and service
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
npm audit --audit-level=high
npm run build
npm test
```

The canonical SDK quickstart and API contracts live in
[`aexhq/aex`](https://github.com/aexhq/aex). Production deployments use the protected Vercel
workflow in `.github/workflows/deploy-vercel.yml`, dispatched on a CI-approved immutable
`release/sha-<commit>` tag. It verifies public routes and the SDK/CLI pins after assigning
`aex.dev` and `www.aex.dev`. The quickstart targets Aex SDK 0.75, CLI 0.42, Brain SDK 0.24 and
Pi/Codex 6.1. It covers client/session lifetime, structured output, attachment-backed media,
Tool schemas and outcomes, and the official MCP, Docker and browser extensions.

The Brain product page and documentation describe the standalone runtime. Canonical Brain prose
and schemas are imported from the immutable revision in `docs.lock.json`; edit them in the Brain
repository. Local validation can set `BRAIN_REPO_PATH` to a Brain checkout. Performance copy must
name its workload and version; archived results are not current release claims.
