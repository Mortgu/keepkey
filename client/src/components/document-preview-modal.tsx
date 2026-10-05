import { useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Download, LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "./button";
import { Dialog } from "./dialog";
import type { DocumentType } from "@keepit/schemas";
import { documentDownloadUrl } from "@/hooks";
import { api } from "@/lib/api-client";

type Props = {
  type: DocumentType;
  documentId: string;
  /** Id des PDF-Artefakts — trennt die Cache-Einträge verschiedener Dokumentversionen. */
  artifactId: string;
  title: string;
  onClose: () => void;
};

/**
 * Zeigt die PDF eines Dokuments. Die signierte URL liefert `attachment` aus und
 * ließe sich nicht einbetten — deshalb werden die Bytes geladen und als Blob-URL
 * angezeigt.
 */
export function DocumentPreviewModal({ type, documentId, artifactId, title, onClose }: Props) {
  const { t } = useTranslation();

  const { data, isPending, isError, refetch } = useQuery({
    queryKey: ["preview", type, documentId, artifactId],
    gcTime: 0,
    queryFn: async () => {
      const { url } = await api<{ url: string }>(
        `/api/documents/${type}/${documentId}/artifacts/pdf/url`,
      );
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Download failed (${res.status})`);
      return new Blob([await res.arrayBuffer()], { type: "application/pdf" });
    },
  });

  const objectUrl = useMemo(() => (data ? URL.createObjectURL(data) : undefined), [data]);
  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl); }, [objectUrl]);

  return (
    <Dialog
      defaultOpen
      dismissible
      className="h-[100vh] w-[100vw]"
      onOpenChange={(open) => { if (!open) onClose(); }}
    >
      <Dialog.Header title={`${t("documentPreview.title")}: ${title}`}>
        <Button
          variant="border"
          size="xs"
          icon={<Download size={14} />}
          onClick={() => window.location.assign(documentDownloadUrl(type, documentId, "pdf"))}
        >
          {t("documentPreview.download")}
        </Button>
      </Dialog.Header>

      <div className="flex min-h-0 flex-1 items-center justify-center">
        {isPending && <LoaderCircle size={24} className="animate-spin text-(--text-secondary)" />}
        {isError && (
          <div className="grid justify-items-center gap-3 text-sm">
            <p className="text-red-500">{t("documentPreview.loadFailed")}</p>
            <Button variant="border" size="sm" onClick={() => refetch()}>
              {t("documentPreview.retry")}
            </Button>
          </div>
        )}
        {objectUrl && (
          <iframe src={objectUrl} title={title} className="size-full border-0" />
        )}
      </div>
    </Dialog>
  );
}
