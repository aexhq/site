"use client";

import { createOpenAPIPage, type OpenAPIPageProps } from "fumadocs-openapi/ui";
import { createCodeUsageGeneratorRegistry } from "fumadocs-openapi/requests/generators";
import { curl } from "fumadocs-openapi/requests/generators/curl";

// The default cURL generator omits credentials declared by OpenAPI security schemes.
const authenticatedExamples = createCodeUsageGeneratorRegistry();
authenticatedExamples.add("curl", {
  ...curl,
  generate: (data, context) => curl.generate({
    ...data,
    header: { ...data.header, Authorization: { value: "Bearer YOUR_TOKEN" } },
  }, context),
});

// createOpenAPIPage builds a client component, so it has to be constructed in a client module.
const PublicAPIPage = createOpenAPIPage({ playground: { enabled: false } });
const AuthenticatedAPIPage = createOpenAPIPage({
  playground: { enabled: false },
  codeUsages: authenticatedExamples,
});

export function OpenAPIPage(props: OpenAPIPageProps) {
  const document = "preloaded" in props ? props.preloaded.docs[props.document] : props.payload.bundled;
  const authenticated = props.operations?.some(({ path, method }) =>
    (document.paths?.[path]?.[method]?.security ?? document.security ?? [])
      .some((scheme) => Object.keys(scheme).length > 0),
  );
  return authenticated ? <AuthenticatedAPIPage {...props} /> : <PublicAPIPage {...props} />;
}
