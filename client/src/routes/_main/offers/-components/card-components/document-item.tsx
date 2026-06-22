import { useEffect, useState } from "react";
import { Download, File, Loader, Trash, UploadCloud } from "lucide-react";
import type { DocumentStatus, Offer, OfferDocument } from "@/types";
import { useDocumentTask, useOfferHook } from "@/hooks";
import { Button, Input } from "@/components";
import { BASE_URL } from "@/lib/api-client";

type Props = {
  document: OfferDocument;
  offer: Offer;
}

export function Document({ offer, document }: Props) {
  const {
    deleteDocument,
    isDeletingDocument,
    errorDeletingDocument,
    upload,
    isUploading,
  } = useOfferHook();
  const { task: polledTask } = useDocumentTask(document.taskId);

  const [status, setStatus] = useState<DocumentStatus>(document.status);
  const [edit, setEdit] = useState<boolean>(false);

  useEffect(() => {
    if (polledTask?.status === "COMPLETED") {
      setStatus("GENERATED");
    }
  }, [polledTask?.status]);

  return (
    <div className="flex items-center justify-between border border-(--border) py-2 pl-4 pr-2 rounded-md gap-2">
      <div className="w-full flex items-center gap-4">
        <div className=" flex items-center gap-2">
          {status === "GENERATED" && <File className="size-4.5" />}

          {(status === "PENDING" ||
            status === "PROCESSING" ||
            status === "UPLOADING") && (
              <Loader className="size-4 animate-spin" />
            )}
        </div>
        <div className="w-full flex flex-col justify-between">
          {!edit && (
            <>
              <h1 className="text-md" onClick={() => setEdit(true)}>
                {document.displayName ?? `v${document.version}`}
              </h1>
              <p className="text-sm text-(--text-secondary)">
                {status}
              </p>
            </>
          )}
          {edit && (
            <Input
              size="xs"
              autoFocus
              onBlur={() => setEdit(false)}
              value={document.displayName ?? ""}
            />
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {status === "GENERATED" && (
          <>
            <a href={`${BASE_URL}/api/offers/${offer.id}/documents/${document.id}/pdf`} download>
              <Button variant="secondary" size="sm" icon={<Download className="size-3.5" />} iconOnly title="PDF herunterladen" />
            </a>
            <a href={`${BASE_URL}/api/offers/${offer.id}/documents/${document.id}/docx`} download>
              <Button variant="secondary" size="sm" icon={<File className="size-3.5" />} iconOnly title="DOCX herunterladen" />
            </a>
          </>
        )}

        <Button variant="secondary" size="sm" icon={<UploadCloud className="size-3.5" />} iconOnly
          onClick={() => upload({ offerId: offer.id, documentId: document.id })} loading={isUploading} disabled={status === "UPLOADED"} />

        <Button variant="secondary" size="sm" icon={<Trash className="size-3.5" />} iconOnly
          onClick={() => deleteDocument({ offerId: offer.id, documentId: document.id })} loading={isDeletingDocument || !!errorDeletingDocument} disabled={isDeletingDocument || !!errorDeletingDocument} />
      </div>
    </div>
  )
}
