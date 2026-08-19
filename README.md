# aex site

The public benchmark record and minimal read-only account dashboard for aex.

- The home page explains the session architecture and renders the measurements published in
  https://github.com/aexhq/brain/blob/main/BENCHMARKS.md.
- The dashboard reads account, balance, usage, and API-key data from the existing control API.
  The account token stays in component memory and passes through a fixed, read-only same-origin
  proxy; it is never written to browser storage.

The default control plane is https://api.aex.dev. Operators may set AEX_API_BASE_URL
to another HTTPS control-plane origin at runtime.

    npm install
    npm run dev
    npm run build
    npm test
