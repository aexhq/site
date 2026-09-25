# Aex site

The public website and account dashboard for [Aex](https://aex.dev). It contains the product
pages, Google sign-in, account and billing status, API-key management, usage, legal pages, and service
status.

The dashboard reads offered and accepted pricebooks from Aex. It shows reported input and
output tokens, hosting charges, absorbed charges and pending estimates. Model keys remain
customer-owned; sandbox, attachment storage and reads have separate resource prices.

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
npx playwright install chromium
npm test
```

Public pages introduce the product, explain its benefit and show the next action. Follow the
shared [wording guide](https://github.com/aexhq/brain/blob/main/references/documentation.md).
The hosted quickstart follows [Aex's guide](https://github.com/aexhq/aex/blob/main/docs/quickstart.md).
The hosted [typed-answer guide](https://aex.dev/docs#structured-output) follows Aex's SDK
contract. Retired Brain structured-output URLs redirect there.

Brain owns the prose and contracts imported through the immutable revision in `docs.lock.json`.
Edit them in Brain; `content/` is replaced at build time. Set `BRAIN_REPO_PATH` to a Brain checkout
for local validation.

Production uses `.github/workflows/deploy-vercel.yml` on a CI-approved annotated
`release/sha-<commit>` tag. It verifies routes and SDK/CLI versions after assigning `aex.dev`
and `www.aex.dev`. Account, billing and deployment behavior comes from the Aex API.
