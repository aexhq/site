import { loader } from "fumadocs-core/source";
import { docs } from "@/.source/server";
import { openapi } from "./openapi";

// baseUrl is what mounts the documentation under /brain/docs rather than /docs.
export const source = loader({
  baseUrl: "/brain/docs",
  source: docs.toFumadocsSource(),
  plugins: [openapi.loaderPlugin()],
});
