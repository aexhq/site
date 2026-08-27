import { createFromSource } from "fumadocs-core/search/server";
import { source } from "@/lib/source";

// A static index, built once, so search needs no server and stays same-origin under the site CSP.
export const revalidate = false;

export const { staticGET: GET } = createFromSource(source);
