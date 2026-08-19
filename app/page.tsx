import type { Metadata } from "next";
import Link from "next/link";
import { SiteFooter } from "./components/SiteFooter";
import { SiteHeader } from "./components/SiteHeader";

export const metadata: Metadata = {
  title: "Agent sessions, kept alive",
  description:
    "Measured agent infrastructure: durable sessions, isolated workspaces, and a brain that adds 1.4 ms before the model.",
};

const brainBenchmarks = [
  ["Platform-added TTFT", "1.4 ms", "p50 · 2.2 ms p99"],
  ["Unpaced throughput", "2,002 turns/s", "K=64 sessions"],
  ["Parallel tool loop", "≈3,430 calls/s", "4 calls × 2 rounds"],
  ["Resident session", "21–31 KiB", "private memory"],
];

const handBenchmarks = [
  ["Endpoint round trip", "2.1 ms", "p50 · 3.4 ms p99"],
  ["Tool call round trip", "4.4 ms", "p50 · 5.3 ms p99"],
  ["Workspace boundary", "MicroVM", "Firecracker-backed"],
  ["Guest credentials", "None", "IMDS gate: pass"],
];

export default function Home() {
  return (
    <main>
      <SiteHeader />

      <section className="hero shell" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="pulse-dot" aria-hidden="true" />
            Measured on production-shaped ARM
          </p>
          <h1 id="hero-title">
            Agent sessions,
            <br />
            <span>kept alive.</span>
          </h1>
          <p className="hero-lede">
            One durable session. One isolated Linux workspace. A small, fast
            brain that remembers every decision without standing between you
            and the model.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="#benchmarks">
              Read the measurements
              <span aria-hidden="true">↘</span>
            </Link>
            <Link className="button button-quiet" href="/dashboard">
              Open dashboard
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>

        <aside className="hero-instrument" aria-label="Headline benchmark">
          <div className="instrument-topline">
            <span>PLATFORM-ADDED TTFT</span>
            <span>p50</span>
          </div>
          <div className="instrument-value">
            1.4<span>ms</span>
          </div>
          <div className="instrument-scale" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <b />
          </div>
          <p>
            From <code>POST /messages</code> to the first assistant delta,
            through the real HTTP + SSE surface.
          </p>
        </aside>
      </section>

      <section className="proof-strip" aria-label="Headline measurements">
        <div className="shell proof-grid">
          <div>
            <strong>2,002</strong>
            <span>turns / second</span>
          </div>
          <div>
            <strong>4.4 ms</strong>
            <span>isolated tool call</span>
          </div>
          <div>
            <strong>21–31 KiB</strong>
            <span>resident session</span>
          </div>
          <div>
            <strong>0</strong>
            <span>guest IAM credentials</span>
          </div>
        </div>
      </section>

      <section className="system-section shell" id="system" aria-labelledby="system-title">
        <div className="section-heading">
          <p className="section-index">01 / THE SYSTEM</p>
          <h2 id="system-title">Long-lived context. Short-lived compute.</h2>
          <p>
            The expensive parts wake when they are useful. Everything needed to
            continue survives in the journal and workspace.
          </p>
        </div>

        <div className="architecture" aria-label="aex request flow">
          <article className="architecture-card control-card">
            <p>01</p>
            <h3>Control</h3>
            <span>Identity · prepaid billing · admission</span>
          </article>
          <div className="architecture-link" aria-hidden="true">
            <span>authorized</span>
            <i />
          </div>
          <article className="architecture-card brain-card">
            <p>02</p>
            <h3>Brain</h3>
            <span>Model loop · sealed prefix · durable journal</span>
          </article>
          <div className="architecture-link" aria-hidden="true">
            <span>tool intent</span>
            <i />
          </div>
          <article className="architecture-card hand-card">
            <p>03</p>
            <h3>Hand</h3>
            <span>Isolated Linux · persistent workspace · real tools</span>
          </article>
        </div>

        <div className="principle-grid">
          <article>
            <span className="principle-mark">A</span>
            <h3>A session is the product</h3>
            <p>
              It can span many messages and many machine incarnations. The same
              sealed agent definition and workspace return every time.
            </p>
          </article>
          <article>
            <span className="principle-mark">B</span>
            <h3>The journal is the truth</h3>
            <p>
              Tool intent lands before dispatch. Tool results land before
              release. The event stream and the bill derive from the same log.
            </p>
          </article>
          <article>
            <span className="principle-mark">C</span>
            <h3>Isolation is admission</h3>
            <p>
              Untrusted code runs in a hardware-backed MicroVM. The guest has no
              execution role and no provider credentials to leak.
            </p>
          </article>
        </div>
      </section>

      <section className="benchmark-section" id="benchmarks" aria-labelledby="benchmarks-title">
        <div className="shell">
          <div className="section-heading light-heading">
            <p className="section-index">02 / THE NUMBERS</p>
            <h2 id="benchmarks-title">Method before marketing.</h2>
            <p>
              These figures measure the platform, not a model: scripted instant
              provider, in-process echo hand, real public HTTP API and SSE path.
            </p>
          </div>

          <div className="benchmark-panels">
            <article className="benchmark-panel">
              <header>
                <div>
                  <span>BRAIN / PROCESS</span>
                  <h3>Decision plane</h3>
                </div>
                <span className="status-chip">CI gated</span>
              </header>
              <div className="benchmark-rows">
                {brainBenchmarks.map(([label, value, note]) => (
                  <div className="benchmark-row" key={label}>
                    <div>
                      <span>{label}</span>
                      <small>{note}</small>
                    </div>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </article>

            <article className="benchmark-panel hand-panel">
              <header>
                <div>
                  <span>HAND / EU-WEST-1</span>
                  <h3>Execution plane</h3>
                </div>
                <span className="status-chip">Real wire</span>
              </header>
              <div className="benchmark-rows">
                {handBenchmarks.map(([label, value, note]) => (
                  <div className="benchmark-row" key={label}>
                    <div>
                      <span>{label}</span>
                      <small>{note}</small>
                    </div>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <div className="method-note">
            <span className="method-number">46→5</span>
            <div>
              <h3>The benchmark already paid for itself.</h3>
              <p>
                The TTFT gate exposed a 46 ms Nagle + delayed-ACK floor under
                every turn. Disabling it on the SSE path took the same run to 5
                ms; the gate now stops that regression returning.
              </p>
            </div>
            <a
              href="https://github.com/aexhq/brain/blob/main/BENCHMARKS.md"
              rel="noreferrer"
              target="_blank"
            >
              Full record <span aria-hidden="true">↗</span>
            </a>
          </div>
        </div>
      </section>

      <section className="security-section shell" id="security" aria-labelledby="security-title">
        <div className="section-heading">
          <p className="section-index">03 / THE BOUNDARY</p>
          <h2 id="security-title">The workspace is real Linux. The boundary is real hardware.</h2>
        </div>
        <div className="security-layout">
          <div className="security-terminal" aria-label="Security gate results">
            <div className="terminal-bar">
              <span />
              <span />
              <span />
              <code>leakage-gate / latest</code>
            </div>
            <pre>
              {"$ probe workspace.cross_session\nPASS  foreign path not found\n\n$ probe journal.secrets\nPASS  provider key absent\n\n$ probe guest.imds\nPASS  role list 404\nPASS  credentials unreachable\n\nresult: 4 passed · 0 leaked"}
            </pre>
          </div>
          <div className="security-copy">
            <p>
              Two adversarially interleaved tenants. Different model dialects.
              Real files on disk. The continuous gate verifies that no workspace
              content, prompt, model identity, event, or provider key crosses the
              session boundary.
            </p>
            <ul>
              <li>One workspace per session</li>
              <li>No execution role in the guest</li>
              <li>Secrets encrypted outside the journal</li>
              <li>Interrupted work is never replayed</li>
            </ul>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <div className="shell cta-inner">
          <div>
            <p className="section-index">CONTROL PLANE / LIVE</p>
            <h2>See every session. See the exact bill.</h2>
          </div>
          <Link className="button button-dark" href="/dashboard">
            Open dashboard <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
