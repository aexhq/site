"use client";

import { type KeyboardEvent, type ReactNode, useId, useState } from "react";

const demos = [
  {
    label: "Start",
    code: `import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { Aex } from "@aexhq/sdk";
import { packageUrl as piPackage } from "@aexhq/loop-pi";

const aex = new Aex({ apiKey: process.env.AEX_API_KEY! });
const loop = await aex.brain.admitAgentloop(
  await readFile(piPackage),
  randomUUID(),
);
const session = await aex.sessions.create({
  agentloop_digest: loop.digest,
  model: { binding_id: "vercel-ai-gateway", model: "openai/gpt-5.4" },
  presentation: { system: "Work carefully.", tools: [] },
  environments: [],
  tool_bindings: [],
  metadata: {},
});

await session.send("Plan a focused afternoon.");`,
  },
  {
    label: "Agentloop",
    code: `// Extension authors write ordinary TypeScript policy.
export function decide(observation) {
  if (observation.kind === "user_message") {
    return { kind: "call_model" };
  }
  return { kind: "finish" };
}

// The package tooling validates and builds the universal
// capability-pure Brain Component. No WIT knowledge is required.`,
  },
  {
    label: "Tools",
    code: `import { definitions } from "@aexhq/tools";

const selected = [definitions.bash, definitions.read];
const presentation = {
  system: "Inspect the workspace.",
  tools: selected.map((tool) => tool.definition),
};
const tool_bindings = selected.map((tool) => ({
  name: tool.definition.name,
  environment_id: "workspace",
  remote_tool_id: tool.remoteToolId,
  grant: {},
}));

// Implementations execute in the remote Environment, not Brain.`,
  },
  {
    label: "Environments",
    code: `import { awsMicrovm } from "@aexhq/env-aws-microvm";

const workspace = awsMicrovm({
  id: "workspace",
  lifecyclePolicy: "session",
});

// Every setup, execute, cancel, and teardown command carries
// the complete sealed binding. Adapter caches are never authority.`,
  },
  {
    label: "Events",
    code: `let cursor = 0;
for await (const event of session.events(cursor)) {
  console.log(event.sequence, event.event_type, event.data);
  cursor = event.sequence;
  await saveCursor(cursor);
}

// Reconnect from the durable cursor. Telemetry is low latency
// and best effort; the journal is the recovery source of truth.`,
  },
] as const;

const syntaxPattern = /(`(?:\\[\s\S]|[^`\\])*`|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\/\/[^\r\n]*|\/\*[\s\S]*?\*\/|\b(?:as|async|await|const|default|export|from|if|import|new|return|throw)\b|\b(?:false|null|true|undefined)\b|\b\d+(?:\.\d+)?\b|\b[A-Z][A-Za-z0-9_]*\b|\b[A-Za-z_$][\w$]*(?=\s*\())/g;
const syntaxKeywords = new Set([
  "as",
  "async",
  "await",
  "const",
  "default",
  "export",
  "from",
  "if",
  "import",
  "new",
  "return",
  "throw",
]);

function highlightCode(source: string): ReactNode[] {
  const highlighted: ReactNode[] = [];
  let cursor = 0;

  for (const match of source.matchAll(syntaxPattern)) {
    const index = match.index ?? 0;
    if (index > cursor) highlighted.push(source.slice(cursor, index));

    const token = match[0];
    let className = "syntax-function";
    if (token.startsWith("//") || token.startsWith("/*")) className = "syntax-comment";
    else if (token.startsWith('"') || token.startsWith("'") || token.startsWith("`")) {
      className = "syntax-string";
    } else if (syntaxKeywords.has(token)) className = "syntax-keyword";
    else if (/^(?:false|null|true|undefined|\d)/.test(token)) className = "syntax-literal";
    else if (/^[A-Z]/.test(token)) className = "syntax-type";

    highlighted.push(
      <span className={className} key={`${index}-${token}`}>
        {token}
      </span>,
    );
    cursor = index + token.length;
  }

  if (cursor < source.length) highlighted.push(source.slice(cursor));
  return highlighted;
}

export function CapabilityDemo() {
  const [activeIndex, setActiveIndex] = useState(0);
  const instanceId = useId();

  function moveTab(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const delta = event.key === "ArrowRight" ? 1 : -1;
    const next = (index + delta + demos.length) % demos.length;
    setActiveIndex(next);
    document.getElementById(`${instanceId}-tab-${next}`)?.focus();
  }

  return (
    <section className="code-demo" aria-label="SDK example">
      <div className="demo-tabs" role="tablist" aria-label="SDK capabilities">
        {demos.map((demo, index) => (
          <button
            aria-controls={`${instanceId}-panel-${index}`}
            aria-selected={activeIndex === index}
            id={`${instanceId}-tab-${index}`}
            key={demo.label}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => moveTab(event, index)}
            role="tab"
            tabIndex={activeIndex === index ? 0 : -1}
            type="button"
          >
            {demo.label}
          </button>
        ))}
      </div>

      {demos.map((demo, index) => (
        <div
          aria-labelledby={`${instanceId}-tab-${index}`}
          className="demo-panel"
          hidden={activeIndex !== index}
          id={`${instanceId}-panel-${index}`}
          key={demo.label}
          role="tabpanel"
          tabIndex={0}
        >
          <pre className="site-code" aria-label={`${demo.label} code example`}>
            <code>{highlightCode(demo.code)}</code>
          </pre>
        </div>
      ))}
    </section>
  );
}
