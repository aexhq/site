import type { Metadata } from "next";
import { SiteFooter } from "../components/SiteFooter";
import { SiteHeader } from "../components/SiteHeader";
import { getLegalIdentity } from "../legal";

export const metadata: Metadata = { title: "Founding beta terms" };

export default function TermsPage() {
  const identity = getLegalIdentity();
  return (
    <main>
      <SiteHeader />
      <article className="legal-page prose-shell">
        <p className="site-kicker">Last updated 19 August 2026</p>
        <h1>Founding beta terms</h1>

        {!identity.configured ? (
          <aside className="launch-blocker">
            Prelaunch preview: the legal operator name, service address, and
            country must be configured before paid invitations are issued.
          </aside>
        ) : null}

        <p>
          These terms apply when you accept an AEX invitation. The waitlist is
          free and does not create a service contract. AEX is operated by{" "}
          {identity.operator || "the operator identified here at launch"}
          {identity.configured ? `, trading as AEX from ${identity.address}, ${identity.country}` : ""}.
          Contact <a href="mailto:support@aex.dev">support@aex.dev</a>.
        </p>

        <h2>Who the beta is for</h2>
        <p>
          The founding beta is for people using AEX wholly or mainly for a
          business, trade, craft, or profession, including individual developers
          building production applications. You must be at least 18 and able to
          enter a contract.
        </p>

        <h2>The service</h2>
        <p>
          AEX provides an API and dashboard for durable agent sessions. The beta
          is an unfinished service: features, limits, prices, and interfaces may
          change, interruptions may occur, and there is no uptime SLA. We will
          give reasonable notice when a change would materially affect active
          use.
        </p>

        <h2>Your account and use</h2>
        <p>
          Keep account recovery tokens and API keys secure. You are responsible
          for activity under your credentials and for the applications, prompts,
          files, model keys, and third-party tools you connect. Do not use AEX
          unlawfully; to harm others; to interfere with the service; to probe
          another user’s data; or to bypass security, limits, or metering.
        </p>

        <h2>Models and third parties</h2>
        <p>
          You bring supported model-provider keys and remain responsible for
          the provider account, terms, content rules, and model charges. Payment
          checkout is provided by Stripe. AEX is not responsible for a
          third-party service outside its control.
        </p>

        <h2>Prices, credit, and refunds</h2>
        <p>
          Prices are shown before top-up and in the live rate card. Credit is in
          USD, prepaid, and deducted from the usage ledger. Model-provider costs
          are separate. You may request a refund of unused credit by contacting
          support; consumed credit and third-party charges are not refundable
          unless the law requires otherwise.
        </p>

        <h2>Your data and intellectual property</h2>
        <p>
          You keep ownership of content and code you provide. You give AEX the
          limited permission needed to host, process, and transmit it to operate
          the service. AEX does not use private session content to train models.
          The <a href="/privacy">privacy notice</a> explains personal-data use.
        </p>

        <h2>Suspension and ending use</h2>
        <p>
          You can stop using AEX and ask for account deletion. We may suspend
          access needed to address security, non-payment, unlawful use, material
          breach, or risk to other users. Where practical, we will explain the
          reason and allow you to export or delete data.
        </p>

        <h2>Liability</h2>
        <p>
          AEX does not exclude liability that cannot legally be excluded. Subject
          to that, the beta is provided without a promise that it will be
          uninterrupted or fit for every purpose, and total liability arising
          from the service is limited to the amount you paid AEX in the three
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
