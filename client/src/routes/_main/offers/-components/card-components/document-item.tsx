import type { Document, DocumentStatus, Offer } from "@/types";
import { useDocumentTask, useOfferHook } from "@/hooks";
import { useEffect, useState } from "react";
import { File, Loader, Trash, UploadCloud } from "lucide-react";
import { Button } from "@/components";

type Props = {
    document: Document;
    offer: Offer;
}

export function Document({ offer, document }: Props) {
    const { deleteDocument, isDeletingDocument, errorDeletingDocument, upload, isUploading, errorUploading } = useOfferHook();
    const { task: polledTask } = useDocumentTask(document.taskId);

    const [status, setStatus] = useState<DocumentStatus>(document.status);

    useEffect(() => {
        if (polledTask?.status === "COMPLETED") {
            setStatus("GENERATED");
        }
    }, [polledTask?.status]);

    return (
        <div className="flex items-center justify-between border border-(--border) py-2 pl-4 pr-2 rounded-md">
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                    {status === "GENERATED" && (
                        <File className="size-4.5" />
                    )}

                    {(status === "PENDING" || status === "PROCESSING" || status === "UPLOADING") && (
                        <Loader className="size-4 animate-spin" />
                    )}
                </div>
                <div className="flex flex-col justify-between">
                    <h1 className="text-md">{document.displayName}</h1>
                    <p className="text-sm text-(--text-secondary)">{document.status}</p>
                </div>
            </div>

            <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={<UploadCloud className="size-3.5" />} iconOnly
                    onClick={() => upload({ offerId: offer.id, documentId: document.id })} loading={isUploading} disabled={document.status === "UPLOADED"} />

                <Button variant="secondary" size="sm" icon={<Trash className="size-3.5" />} iconOnly
                    onClick={() => deleteDocument({ documentId: document.id })} loading={isDeletingDocument || !!errorDeletingDocument} disabled={isDeletingDocument || !!errorDeletingDocument} />
            </div>
        </div>
    )
}