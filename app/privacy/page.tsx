import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { getLegalIdentity } from "../legal";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  const identity = getLegalIdentity();
  return (
    <main>
      <SiteHeader />
      <article className="legal-page prose-shell">
        <p className="site-kicker">Last updated 19 August 2026</p>
        <h1>Privacy</h1>

        {!identity.configured ? (
          <aside className="launch-blocker">
            Prelaunch preview: the legal operator name, service address, and
            country must be configured before the public waitlist opens.
          </aside>
        ) : null}

        <p>
          This notice explains how {identity.operator || "the AEX operator"},
          trading as AEX, uses personal information. The operator is the data
          controller. You can contact AEX at{" "}
          <a href="mailto:support@aex.dev">support@aex.dev</a>.
        </p>

        {identity.configured ? (
          <p><strong>Service address:</strong> {identity.address}, {identity.country}.</p>
        ) : null}

        <h2>Information we use</h2>
        <p>
          We use the email you submit to manage the waitlist and invitations.
          If you create an account, we also process account identifiers,
          essential session-cookie data, API-key metadata, top-ups, usage,
          support messages, and technical security records. Stripe processes
          card details on its hosted checkout; AEX does not receive full card
          numbers.
        </p>

        <h2>Why we use it</h2>
        <p>
          We process this information to respond to your request for beta
          access, provide and secure the service, keep an accurate usage and
          payment ledger, meet legal obligations, and handle support. We do not
          use the waitlist for marketing and do not sell personal information.
        </p>

        <h2>Providers and location</h2>
        <p>
          AEX uses infrastructure and service providers including AWS for the
          production runtime, OpenAI Sites and Cloudflare for the website, and
          Stripe for payments. Production session data is hosted in AWS
          eu-west-1. A provider may process limited account or technical data in
          another country under its contractual safeguards.
        </p>

        <h2>Retention</h2>
        <p>
          Waitlist records are removed when no longer needed for the beta or on
          a valid deletion request. Account and session data is retained while
          the account is active, then deleted or anonymised except where records
          must be kept for security, disputes, tax, or accounting. Deleted
          production data can remain in encrypted backups for up to seven days.
        </p>

        <h2>Your choices and rights</h2>
        <p>
          You can ask to access, correct, delete, restrict, or export your
          personal information, or object to some uses, by emailing{" "}
          <a href="mailto:support@aex.dev">support@aex.dev</a>. You can also
          complain to the UK Information Commissioner’s Office. The dashboard
          uses only an essential authentication cookie; there are no advertising
          or analytics cookies on the public site.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
