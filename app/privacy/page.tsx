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
        <p className="site-kicker">Last updated 20 August 2026</p>
        <h1>Privacy</h1>

        <p>
          This notice explains how {identity.operator}, trading as Aex, uses
          personal information. {identity.operator} is the data controller. You
          can contact Aex at{" "}
          <a href="mailto:support@aex.dev">support@aex.dev</a>.
        </p>

        <p>
          <strong>Company:</strong>{" "}
          <a href={identity.companiesHouseUrl}>
            {identity.companyNumber}, registered in {identity.registrationJurisdiction}
          </a>
          . <strong>Registered office:</strong> {identity.registeredOffice},{" "}
          {identity.country}.
        </p>

        <h2>Information we use</h2>
        <p>
          We use the email you submit to manage the waitlist and invitations.
          If you create an account, we also process account identifiers,
          essential session-cookie data, API-key metadata, top-ups, usage,
          support messages, and technical security records. Stripe processes
          card details on its hosted checkout; Aex does not receive full card
          numbers.
        </p>

        <h2>Why we use it</h2>
        <p>
          We process this information to respond to your request for alpha
          access, provide and secure the service, keep an accurate usage and
          payment ledger, meet legal obligations, and handle support. We do not
          use the waitlist for marketing and do not sell personal information.
        </p>

        <h2>Providers and location</h2>
        <p>
          Aex uses infrastructure and service providers including AWS for the
          production runtime, Vercel for website hosting, Cloudflare for DNS and
          edge proxying, and Stripe for payments. A provider may process limited
          account or technical data in another country under its contractual
          safeguards.
        </p>

        <h2>Retention</h2>
        <p>
          Waitlist records are removed when no longer needed for the alpha or on
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
