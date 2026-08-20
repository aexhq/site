"use client";

import { KeyboardEvent, useId, useState } from "react";

const demos = [
  {
    label: "Start",
    code: `import { Aex } from "@aexhq/sdk";
import { bash, read, subagents, webSearch } from "@aexhq/tools";
import lookupOrder from "./tools/lookup-order.js";

const aex = new Aex({ apiKey: process.env.AEX_API_KEY! });

const session = await aex.sessions.create({
  model: {
    provider: "openai",
    name: "openai/gpt-5.4",
    apiKey: process.env.AI_GATEWAY_API_KEY!,
    baseUrl: "https://ai-gateway.vercel.sh",
  },
  tools: [lookupOrder, bash(), read(), webSearch(), subagents()],
});`,
  },
  {
    label: "Custom tool",
    code: `import { defineTool } from "@aexhq/sdk";
import { z } from "zod";

const order = z.object({
  id: z.string(),
  status: z.enum(["paid", "held", "refunded"]),
});

const lookupOrder = defineTool({
  module: import.meta.url,
  name: "lookup_order",
  description: "Look up the current state of an order.",
  input: z.object({ id: z.string() }),
  output: order,
  requiredEnv: ["SHOP_API_TOKEN"],
  async execute({ id }) {
    const response = await fetch(\`https://shop.example/orders/\${id}\`, {
      headers: { authorization: \`Bearer \${process.env.SHOP_API_TOKEN}\` },
    });
    if (!response.ok) throw new Error("Order lookup failed");
    return order.parse(await response.json());
  },
});

export default lookupOrder;`,
  },
  {
    label: "Typed result",
    code: `import { z } from "zod";

const review = await session.send(
  "Investigate order ord_1842 and recommend the next action.",
  {
    output: z.object({
      status: z.enum(["clear", "needs_review"]),
      evidence: z.array(z.string()),
      nextAction: z.string(),
    }),
  },
);

review.nextAction; // fully typed`,
  },
  {
    label: "Continue",
    code: `await session.send(
  "Save the evidence to /workspace/order-review.md.",
);

const followUp = await session.send(
  "Now draft a concise reply for the customer.",
  {
    output: z.object({
      subject: z.string(),
      reply: z.string(),
    }),
  },
);`,
  },
] as const;

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
    <section className="capability-demo" aria-labelledby="demo-title">
      <div className="demo-heading">
        <p className="section-index">01 / SDK</p>
        <div>
          <h2 id="demo-title">From one tool to a finished result.</h2>
        </div>
      </div>

      <div className="demo-window">
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
              <span>{String(index + 1).padStart(2, "0")}</span>
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
            <pre aria-label={`${demo.label} code example`}>
              <code>{demo.code}</code>
            </pre>
          </div>
        ))}
      </div>
    </section>
  );
}
