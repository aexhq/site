import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";
import { WaitlistForm } from "./components/WaitlistForm";

export const metadata: Metadata = {
  title: "Your agent keeps its place",
  description:
    "AEX is the durable session runtime for agents: model, tools, history, and Linux workspace in one resumable lifecycle.",
};

const productPoints = [
  {
    index: "01",
    title: "A session, not a sandbox",
    body: "The model loop, tools, conversation, files, and artifacts share one durable lifecycle.",
  },
  {
    index: "02",
    title: "Continue, don’t reconstruct",
    body: "A session can release compute between turns and return to the same workspace when work resumes.",
  },
  {
    index: "03",
    title: "Your models, one ledger",
    body: "Bring OpenAI or Anthropic keys. AEX meters the runtime clearly and adds no model markup.",
  },
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="home-hero shell" aria-labelledby="hero-title">
        <div className="home-hero-copy">
          <p className="eyebrow">
            <span className="pulse-dot" aria-hidden="true" />
            Founding Beta · eu-west-1
          </p>
          <h1 id="hero-title">Your agent keeps its place.</h1>
          <p className="home-hero-lede">
            AEX gives an agent one durable session for its model, tools, history,
            and Linux workspace. Turn it off. Come back. Continue.
          </p>
          <WaitlistForm />
          <Link className="invited-link" href="/dashboard?mode=invite">
            Already invited? Finish setup <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="continuity-card" aria-label="A session continuing across two turns">
          <header>
            <span>SESSION / AEX</span>
            <span className="live-label"><i /> resumable</span>
          </header>
          <div className="continuity-track">
            <article>
              <span className="track-node">01</span>
              <div>
                <small>TURN 12 · COMPLETE</small>
                <strong>Research and write</strong>
                <p>Files, decisions, and context committed.</p>
              </div>
            </article>
            <article className="track-hold">
              <span className="track-node">—</span>
              <div>
                <small>BETWEEN TURNS</small>
                <strong>Compute released</strong>
                <p>The session and workspace stay ready.</p>
              </div>
            </article>
            <article className="track-resume">
              <span className="track-node">02</span>
              <div>
                <small>TURN 13 · READY</small>
                <strong>Continue from here</strong>
                <p>Same agent. Same place. New turn.</p>
              </div>
            </article>
          </div>
          <footer>
            <span>MODEL <b>BYOK</b></span>
            <span>HAND <b>1 GB</b></span>
            <span>STATE <b>HELD</b></span>
          </footer>
        </div>
      </section>

      <section className="category-line" aria-label="AEX product category">
        <div className="shell">
          <p>Deployment platforms run apps.</p>
          <p>Sandbox clouds run code.</p>
          <p><strong>AEX runs the agent session.</strong></p>
        </div>
      </section>

      <section className="product-section shell" id="product" aria-labelledby="product-title">
        <div className="minimal-heading">
          <p className="section-index">THE PRODUCT</p>
          <h2 id="product-title">One boundary for the whole job.</h2>
          <p>
            An agent is more than a process. AEX keeps the parts that must agree
            under one session identity, from the first model call to the last artifact.
          </p>
        </div>
        <div className="product-points">
          {productPoints.map((point) => (
            <article key={point.index}>
              <span>{point.index}</span>
              <h3>{point.title}</h3>
              <p>{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="lifecycle-section" aria-labelledby="lifecycle-title">
        <div className="shell lifecycle-inner">
          <div>
            <p className="section-index">THE DIFFERENCE</p>
            <h2 id="lifecycle-title">Long-lived state. Short-lived compute.</h2>
          </div>
          <div className="lifecycle-rail" aria-label="Session lifecycle">
            <div>
              <span>01</span>
              <strong>Start</strong>
              <small>Agent + workspace</small>
            </div>
            <i aria-hidden="true" />
            <div>
              <span>02</span>
              <strong>Work</strong>
              <small>Model + tools</small>
            </div>
            <i aria-hidden="true" />
            <div className="rail-accent">
              <span>03</span>
              <strong>Hold</strong>
              <small>No active compute</small>
            </div>
            <i aria-hidden="true" />
            <div>
              <span>04</span>
              <strong>Resume</strong>
              <small>Continue in place</small>
            </div>
          </div>
        </div>
      </section>

      <section className="pricing-section shell" id="pricing" aria-labelledby="pricing-title">
        <div className="minimal-heading pricing-heading">
          <p className="section-index">FOUNDING BETA PRICING</p>
          <h2 id="pricing-title">Pay for the runtime, not the promise.</h2>
          <p>No subscription. No model markup. Prepaid credit is refundable while unused.</p>
        </div>
        <div className="price-grid">
          <article className="price-primary">
            <span>Active 1 GB session</span>
            <strong><b>$0.12</b> / hour</strong>
            <p>Charged while the agent is actively working.</p>
          </article>
          <article>
            <span>Durable workspace</span>
            <strong><b>$0.03</b> / GB-month</strong>
            <p>Files remain available between turns.</p>
          </article>
          <article>
            <span>Models</span>
            <strong><b>BYOK</b></strong>
            <p>OpenAI and Anthropic, billed by your provider.</p>
          </article>
        </div>
        <div className="pricing-note">
          <p><strong>$10 minimum</strong> top-up · <strong>$1,000 maximum</strong> · USD</p>
          <a href="https://api.aex.dev/v1/rates" rel="noreferrer" target="_blank">
            Live rate card <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>

      <section className="beta-section" id="beta" aria-labelledby="beta-title">
        <div className="shell beta-inner">
          <div>
            <p className="section-index">FOUNDING BETA</p>
            <h2 id="beta-title">A small launch, on purpose.</h2>
            <p>
              One 1 GB shape in eu-west-1, OpenAI and Anthropic models, bring-your-own keys,
              and direct support. No uptime SLA during the beta.
            </p>
          </div>
          <WaitlistForm compact />
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
