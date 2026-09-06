import { createOpenAPI } from "fumadocs-openapi/server";

// Relative so generated pages stay portable between a laptop and CI.
export const openapiInput = "content/contract/session/v1/openapi.yaml";

export const openapi = createOpenAPI({ input: [openapiInput] });
