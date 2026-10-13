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
});
