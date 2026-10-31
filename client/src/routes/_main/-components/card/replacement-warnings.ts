import type {ReplacementWarning} from "@keepit/schemas";
import type {FieldChange} from "@/components";
import {showToast} from "@/components";

export function handleReplacementWarnings(
    warnings: Array<ReplacementWarning>,
    openChanges: (changes: Array<FieldChange>) => void,
) {
    const changes = warnings.filter((warning): warning is FieldChange => warning.code === "FIELD_CHANGED");
    if (changes.length > 0) openChanges(changes);

    for (const warning of warnings) {
        if (warning.code === "DOCUMENT_MISMATCH") {
            showToast.warning("documents.toast.warning.documentMismatch");
        }
    }
}
