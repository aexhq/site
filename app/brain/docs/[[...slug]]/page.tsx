import { notFound } from "next/navigation";
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from "fumadocs-ui/page";
import { getMDXComponents } from "@/mdx-components";
import { openapi } from "@/lib/openapi";
import { OpenAPIPage } from "@/lib/openapi-page";
import { source } from "@/lib/source";

export function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();
  return { title: page.data.title, description: page.data.description };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}) {
  const { slug } = await params;
  const page = source.getPage(slug);
  if (!page) notFound();

  const MDX = page.data.body;

  // Generated API pages render <OpenAPIPage document="..." />. The document has to be resolved on
  // the server and handed to the client component; ordinary prose pages need none of this.
  const isApiPage = "_openapi" in page.data;
  const preloaded = isApiPage ? await openapi.preloadOpenAPIPage(page) : undefined;
  const components = getMDXComponents(
    preloaded
      ? {
          OpenAPIPage: (props) => <OpenAPIPage {...props} {...preloaded} />,
          APIPage: (props) => <OpenAPIPage {...props} {...preloaded} />,
        }
      : undefined,
  );

  return (
    <DocsPage toc={page.data.toc} full={page.data.full}>
      <DocsTitle>{page.data.title}</DocsTitle>
      <DocsDescription>{page.data.description}</DocsDescription>
      <DocsBody>
        <MDX components={components} />
      </DocsBody>
    </DocsPage>
  );
}
