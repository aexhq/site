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
        <p className="site-kicker">Last updated 14 September 2026</p>
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
          We process your verified Google identifier and email to create your
          account, essential authentication cookies, API-key metadata, usage,
          support messages, and technical security records. Brain processes
          session content, tool results, and model credentials to run your agents.
          For payments, we retain amounts, status, provider references and receipt
          links. Stripe collects payment details through Checkout; Aex does not
          receive your full card number.
        </p>

        <h2>Why we use it</h2>
        <p>
          We process this information to provide and secure the service, keep accurate usage records, meet legal obligations, and handle support. We do not
          sell personal information.
        </p>

        <h2>Providers and location</h2>
        <p>
          Aex uses infrastructure and service providers including AWS for the
          production runtime and account database in us-east-1, Vercel for website hosting, Cloudflare for DNS,
          Google for sign-in, Modal for managed tool execution, and Stripe for payments.
          Managed tools process the inputs, files and scoped application configuration
          supplied to them. Your chosen model provider processes model requests. A provider may process limited
          account or technical data in another country under its contractual
          safeguards.
        </p>

        <h2>Retention</h2>
        <p>
          Session retention is currently seven days. Account data is retained while
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
          uses an essential authentication cookie and local storage for pending
          payment request identifiers and amounts, so a reload can recover the same
          request. There are no advertising or analytics cookies on the public site.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
