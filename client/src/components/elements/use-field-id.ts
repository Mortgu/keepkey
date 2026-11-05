import { useId } from "react";

/** Resolves a field's id: the caller's explicit id, or a generated fallback — so a label can always be linked to its control. */
export function useFieldId(id?: string): string {
    const generatedId = useId();
    return id ?? generatedId;
}
