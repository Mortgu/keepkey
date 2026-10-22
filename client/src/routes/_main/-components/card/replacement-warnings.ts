import type { ReplacementWarning } from "@keepit/schemas";
import type { FieldChange } from "@/components";
import { showToast } from "@/components";

/**
 * Verteilt die Hinweise zu einer ersetzten Datei. Abweichende Felder braucht
 * der Nutzer im Zusammenhang und mit einer Entscheidung — sie gehen an
 * `openChanges` (das Modal). Alles andere ist eine kurze Meldung und kommt
 * als Toast. Nichts davon blockiert: die Datei ist bereits übernommen.
 */
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
