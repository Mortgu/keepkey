const PURE_UTILITY_FILE = [
    /(^|\/)index\.ts$/, // barrel re-exports
    /-schema\.ts$/, // zod schema modules
    /(^|\/)_schemas\//, // schema directories
    /-api\.ts$/, // REST client functions
    /-keys\.ts$/, // query-key factories
    /-queries\.ts$/, // query-option factories
    /(^|\/)lib\//, // pure utility helpers
    /(^|\/)utils\//, // pure utility helpers
    /routeTree\.gen\.ts$/, // generated route tree
];

/**
 * Whether a client source file plausibly contains a React component or
 * custom hook, and therefore benefits from the React Compiler babel pass.
 *
 * Deliberately permissive: this excludes only the specific conventions
 * known to hold pure data/schema/API-client code (see PURE_UTILITY_FILE),
 * rather than allow-listing component/hook naming conventions. A missed
 * exclusion just means an extra file gets compiled for no benefit; a missed
 * inclusion would silently drop a real component or hook from compilation,
 * which costs more than it saves.
 */
export const isReactCompilerTarget = (filename: string): boolean => {
    if (!/\.tsx?$/.test(filename)) return false;
    return !PURE_UTILITY_FILE.some((pattern) => pattern.test(filename));
};
