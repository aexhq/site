# aex site

The Beta product site and account dashboard for AEX.

- The home page explains the durable-session product, launch envelope, pricing, and waitlist.
- The dashboard handles invitation-only signup, prepaid checkout, API-key management, usage,
  and balance through the control API.
- The account token is held in an `HttpOnly`, same-site cookie. It is never available to browser
  JavaScript or written to local/session storage.
- The same-origin control proxy accepts only an explicit method/path allowlist; the control API
  remains the source of truth for waitlist, account, billing, and usage state.
- The canonical API quickstart and OpenAPI contracts live in the `aexhq/aex` repository rather
  than being duplicated here.

The default control plane is https://api.aex.dev. Operators may set AEX_API_BASE_URL
to another HTTPS control-plane origin at runtime.

The site is a native Next.js deployment on Vercel. Generated deployment URLs remain
protected. A pinned GitHub Actions workflow stages each `main` build without assigning
custom domains; an explicit promotion assigns the reviewed build to `aex.dev`.

    npm install
    npm run dev
    npm run build
    npm test
