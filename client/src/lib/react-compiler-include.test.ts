import { describe, expect, it } from "vitest";
import { isReactCompilerTarget } from "./react-compiler-include";

describe("isReactCompilerTarget", () => {
    it("includes component files", () => {
        expect(isReactCompilerTarget("src/components/elements/button.tsx")).toBe(true);
    });

    it("includes custom hook files", () => {
        expect(isReactCompilerTarget("src/hooks/use-debounce.ts")).toBe(true);
    });

    it("excludes zod schema files", () => {
        expect(isReactCompilerTarget("src/components/modules/modals/offer/_schemas/offer-modal-schema.ts")).toBe(false);
    });

    it("excludes pure API-client files", () => {
        expect(isReactCompilerTarget("src/hooks/orders/order-api.ts")).toBe(false);
    });

    it("includes *-mutations.ts files, which export useXxx hook wrappers in this codebase", () => {
        expect(isReactCompilerTarget("src/hooks/contracts/contract-mutations.ts")).toBe(true);
    });

    it("excludes *-queries.ts files, which only export query-key factories, not hooks", () => {
        expect(isReactCompilerTarget("src/hooks/contracts/contract-queries.ts")).toBe(false);
    });

    it("excludes barrel index.ts re-export files", () => {
        expect(isReactCompilerTarget("src/hooks/index.ts")).toBe(false);
    });

    it("excludes pure utility/lib files", () => {
        expect(isReactCompilerTarget("src/lib/format.ts")).toBe(false);
    });

    // Real hook files that a naming-convention allow-list previously missed
    // (caught in code review): context providers, capability/task hooks,
    // and the pre-existing `-page.hooks.ts` dot-suffix convention.
    it("includes hook files exposed via a context module", () => {
        expect(isReactCompilerTarget("src/context/auth-context.ts")).toBe(true);
        expect(isReactCompilerTarget("src/components/modules/modals/offer/offer-modal-context.ts")).toBe(true);
    });

    it("includes hook files that don't follow the use-/*-hooks.ts naming convention", () => {
        expect(isReactCompilerTarget("src/hooks/documents/document-capabilities.ts")).toBe(true);
        expect(isReactCompilerTarget("src/hooks/documents/document-task.ts")).toBe(true);
    });

    it("includes hook files using the -page.hooks.ts dot-suffix convention", () => {
        expect(isReactCompilerTarget("src/routes/_main/customers/-page.hooks.ts")).toBe(true);
    });
});
