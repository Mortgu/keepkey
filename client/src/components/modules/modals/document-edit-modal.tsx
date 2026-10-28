import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import type { DocumentType } from "@keepit/schemas";
import { fetchDocxBytes } from "@/hooks";
import { Button, Dialog, DocumentDocxEditor, Spinner, showToast } from "@/components";

type Props = {
  type: DocumentType;
  documentId: string;
  /** Id des DOCX-Artefakts — trennt die Cache-Einträge verschiedener Dokumentversionen. */
  artifactId: string;
  displayName: string;
  onClose: () => void;
  onSave: (file: File) => Promise<unknown>;
};

/**
 * Öffnet die DOCX eines Dokuments im Editor. Gespeichert wird über denselben
 * Weg wie beim Ersetzen der Datei; der Editor bringt Speichern/Abbrechen in
 * seiner eigenen Titelleiste mit, deshalb kein Dialog-Header.
 */
export function DocumentEditModal({ type, documentId, artifactId, displayName, onClose, onSave }: Props) {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["docx", type, documentId, artifactId],
    gcTime: 0,
    queryFn: () => fetchDocxBytes(type, documentId),
  });

  const save = async (file: File) => {
    try {
      await onSave(file);
      showToast.success("documents.toast.saved");
      onClose();
    } catch {
      // Editor offen lassen, damit nichts verloren geht;
      // der globale onError-Handler meldet den Fehler.
    }
  };

  return (
    <Dialog
      defaultOpen
      className="h-[100vh] w-[100vw]"
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <div className="flex min-h-0 flex-1 items-center justify-center">
        {isPending && <Spinner size={24} className="text-(--text-secondary)" />}
        {isError && (
          <div className="grid justify-items-center gap-3 text-sm">
            <p className="text-red-500">{t("documents.edit.loadFailed")}</p>
            <div className="flex gap-2">
              <Button variant="border" size="sm" onClick={onClose}>
                {t("button.cancel")}
              </Button>
              <Button variant="border" size="sm" onClick={() => refetch()}>
                {t("documentPreview.retry")}
              </Button>
            </div>
          </div>
        )}
        {data && (
          <div className="size-full">
            <DocumentDocxEditor
              document={data}
              displayName={displayName}
              onSave={(file) => void save(file)}
              onClose={onClose}
            />
          </div>
        )}
      </div>
    </Dialog>
  );
}
