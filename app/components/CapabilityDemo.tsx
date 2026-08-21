"use client";

import { type KeyboardEvent, type ReactNode, useId, useState } from "react";

const demos = [
  {
    label: "Start",
    code: `import { Aex } from "@aexhq/sdk";

const aex = new Aex({ apiKey: process.env.AEX_API_KEY! });

const session = await aex.sessions.create({
  model: {
    provider: "openai",
    name: "gpt-5.4",
    apiKey: process.env.OPENAI_API_KEY!,
  },
});

const reply = await session.send("Plan my day.");
console.log(reply);`,
  },
  {
    label: "Tools",
    code: `import { tool } from "@aexhq/sdk";
import { z } from "zod";
import { weather } from "../weather.js";

const getWeather = tool(
  z.object({ city: z.string() }),
  async function getWeather({ city }) {
    return weather.current(city);
  },
)
  .describe("Get the current weather for a city.")
  .client();

export default getWeather;`,
  },
  {
    label: "Structured Outputs",
    code: `import { z } from "zod";

const plan = await session.send(
  "Plan a focused afternoon.",
  {
    output: z.object({
      summary: z.string(),
      tasks: z.array(z.string()),
    }),
  },
);

console.log(plan.tasks); // fully typed`,
  },
  {
    label: "Files",
    code: `const state = await session.sandbox.create();
if (!state.generation) throw new Error("Sandbox is not ready");

await session.sandbox.files.upload(
  "/workspace/brief.txt",
  "Turn these notes into a launch plan.",
  { generation: state.generation },
);

const files = await session.sandbox.files.list("/workspace", {
  generation: state.generation,
});`,
  },
  {
    label: "Sandboxes",
    code: `await session.send(
  [
    "Create two isolated sandboxes.",
    "Run the parser tests in the first.",
    "Benchmark 100 lookups in the second.",
    "Compare the results, then terminate both.",
  ].join("\\n"),
);`,
  },
  {
    label: "Storage",
    code: `const state = await session.sandbox.status();
if (!state.generation) throw new Error("Sandbox is not ready");

await session.storage.copyFromSandbox({
  path: "/workspace/customer-review.md",
  key: "reviews/customer.md",
  sandboxGeneration: state.generation,
});

const saved = await session.storage.list({
  prefix: "reviews/",
});`,
  },
  {
    label: "Subagents",
    code: `const researcher = await session.children.create({
  name: "research",
  prompt: "Compare the three strongest options.",
  forkTurns: "3",
});

const result = await researcher.wait();
console.log(result.state);`,
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
