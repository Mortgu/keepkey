const COMPONENT_FILE = /\.tsx$/;
const HOOK_FILE = /(^|\/)use-[^/]+\.ts$/;
const HOOK_MODULE_FILE = /-(hooks|mutations)\.ts$/;

/**
 * Whether a client source file plausibly contains a React component or
 * custom hook, and therefore benefits from the React Compiler babel pass.
 * Used to scope that pass away from schemas, API clients, and other pure
 * utility modules it gains nothing from processing.
 */
export const isReactCompilerTarget = (filename: string): boolean => {
    return COMPONENT_FILE.test(filename) || HOOK_FILE.test(filename) || HOOK_MODULE_FILE.test(filename);
};
