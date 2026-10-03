import { globSync as glob } from "tinyglobby";

// Next only needs directory roots; avoid fast-glob's unpatched braces dependency.
export const globSync = (patterns, options) => glob(patterns, { ...options, expandDirectories: false, absolute: true });
