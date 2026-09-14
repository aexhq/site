import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { getLegalIdentity } from "../legal";

export const metadata: Metadata = { title: "Alpha terms" };

export default function TermsPage() {
  const identity = getLegalIdentity();
  return (
    <main>
      <SiteHeader />
      <article className="legal-page prose-shell">
        <p className="site-kicker">Last updated 14 September 2026</p>
        <h1>Alpha terms</h1>

        <p>
          These terms apply when you register for or use Aex. Aex is operated by{" "}
          {identity.operator}, trading as Aex (
          <a href={identity.companiesHouseUrl}>
            company number {identity.companyNumber}
          </a>
          ), registered in {identity.registrationJurisdiction}. Its registered
          office is {identity.registeredOffice}, {identity.country}. Contact{" "}
          <a href="mailto:support@aex.dev">support@aex.dev</a>.
        </p>

        <h2>Who the alpha is for</h2>
        <p>
          The alpha is open to developers using Aex for personal, educational,
          open-source, experimental, or commercial projects. You must be at
          least 18 and able to enter a contract.
        </p>

        <h2>The service</h2>
        <p>
          Aex provides an API and dashboard for durable agent sessions. The alpha
          is an unfinished service: features, limits, prices, and interfaces may
          change, interruptions may occur, and there is no uptime SLA. We will
          give reasonable notice when a change would materially affect active
          use.
        </p>

        <h2>Your account and use</h2>
        <p>
          Keep your Google account and API keys secure. You are responsible
          for activity under your credentials and for the applications, prompts,
          files, model keys, and third-party tools you connect. Do not use Aex
          unlawfully; to harm others; to interfere with the service; to probe
          another user’s data; or to bypass security, limits, or metering.
        </p>

        <h2>Models and third parties</h2>
        <p>
          You bring supported model-provider keys and remain responsible for
          the provider account, terms, content rules, and model charges. Aex is not responsible for a
          third-party service outside its control.
        </p>

        <h2>Pricing and credits</h2>
        <p>
          Preview accounts have no Aex hosting charge until they accept a published
          pricebook and enable prepaid hosting. The dashboard presents prices and
          spend limits before acceptance. Managed compute requires prepaid credits.
          You pay your model provider directly, separately from Aex charges.
        </p>
        <p>
          Where payments are enabled, you can top up manually through Stripe and
          request a refund of unused, unreserved credits to the original payment
          method. There are no automatic topups. Work reserves credits before it
          starts; settlement charges measured usage and releases the remainder.
          Pending work and refunds can keep credits reserved. Price changes require
          acceptance for new work; existing reservations keep their agreed prices.
        </p>

        <h2>Your data and intellectual property</h2>
        <p>
          You keep ownership of content and code you provide. You give Aex the
          limited permission needed to host, process, and transmit it to operate
          the service. Aex does not use private session content to train models.
          The <a href="/privacy">privacy notice</a> explains personal-data use.
        </p>

        <h2>Suspension and ending use</h2>
        <p>
          You can stop using Aex and ask for account deletion. We may suspend
          access needed to address security, non-payment, unlawful use, material
          breach, or risk to other users. Where practical, we will explain the
          reason and allow you to export or delete data.
        </p>

        <h2>Liability</h2>
        <p>
          Aex does not exclude liability that cannot legally be excluded. Subject
          to that, the alpha is provided without a promise that it will be
          uninterrupted or fit for every purpose, and total liability arising
          from the service is limited to the amount you paid Aex in the three
          months before the event giving rise to the claim.
        </p>

        <h2>Law and changes</h2>
        <p>
          These terms are governed by the laws of England and Wales, and its
          courts have jurisdiction. Updated terms will show a new date; material
          changes will be presented before continued paid use.
        </p>
      </article>
      <SiteFooter />
    </main>
  );
}
