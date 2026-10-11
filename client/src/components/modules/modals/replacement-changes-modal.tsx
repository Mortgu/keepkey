import { useState } from "react";
import { useTranslation } from "react-i18next";
import type { ReplacementWarning } from "@keepit/schemas";
import { Button, Checkbox, Dialog } from "@/components";

export type FieldChange = Extract<ReplacementWarning, { code: "FIELD_CHANGED" }>;

type Props = {
  changes: Array<FieldChange>;
  isPending: boolean;
  onClose: () => void;
  onAdopt: (fields: Array<string>) => Promise<unknown>;
};

/**
 * Zeigt, wo eine ersetzte Datei vom erzeugten Stand abweicht. Die Datei selbst
 * ist längst übernommen — hier entscheidet der Nutzer nur, ob die gespeicherten
 * Daten des Dokuments die neuen Werte bekommen oder die Abweichung bleibt.
 */
export function ReplacementChangesModal({ changes, isPending, onClose, onAdopt }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(() => new Set(changes.map((change) => change.field)));

  const toggle = (field: string) => setSelected((current) => {
    const next = new Set(current);
    if (!next.delete(field)) next.add(field);
    return next;
  });

  const adopt = async () => {
    try {
      await onAdopt(changes.map((change) => change.field).filter((field) => selected.has(field)));
      onClose();
    } catch {
      // The owning card displays the mutation error and keeps the modal open.
    }
  };

  return (
    <Dialog
      defaultOpen
      size="md"
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <Dialog.Header title={t("documents.changes.title")} description={t("documents.changes.description")} />
      <Dialog.Body>
        <ul className="grid gap-3">
          {changes.map((change) => (
            <li key={change.field} className="grid gap-1 rounded-md border border-(--border) p-3">
              <Checkbox
                label={change.field}
                checked={selected.has(change.field)}
                onChange={() => toggle(change.field)}
              />
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 pl-6 text-sm">
                <dt className="text-(--text-500)">{t("documents.changes.generated")}</dt>
                <dd className="text-(--text-500) line-through">{change.expected || "—"}</dd>
                <dt className="text-(--text-500)">{t("documents.changes.inFile")}</dt>
                <dd className="font-medium">{change.actual || "—"}</dd>
              </dl>
            </li>
          ))}
        </ul>
      </Dialog.Body>
      <Dialog.Footer>
        <Button variant="border" size="sm" onClick={onClose} disabled={isPending}>
          {t("documents.changes.ignore")}
        </Button>
        <Button size="sm" onClick={adopt} loading={isPending} disabled={selected.size === 0 || isPending}>
          {t("documents.changes.adopt", { count: selected.size })}
        </Button>
      </Dialog.Footer>
    </Dialog>
  );
}
