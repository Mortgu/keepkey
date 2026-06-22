import { Button } from "@/components";
import { useDocumentTask, useOfferHook } from "@/hooks";
import type { DocumentStatus, OfferDocument } from "@/types"
import { LoaderCircle, Trash, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
    offerDocument: OfferDocument;
}

export default function OfferCardDocument({ offerDocument }: Props) {
    const [status, setStatus] = useState<DocumentStatus>(offerDocument.status);
    const { task: polledTask } = useDocumentTask(offerDocument.taskId);

    const {
        deleteDocument,
        isDeletingDocument,
        errorDeletingDocument,
        upload,
        isUploading,
    } = useOfferHook();

    useEffect(() => {
        if (polledTask?.status === "COMPLETED") {
            setStatus("GENERATED");
        }
    }, [polledTask?.status]);

    return (
        <div className="flex items-center justify-between py-2 border-b border-(--border)">
            <div className="w-full flex items-center gap-4">
                {status === "GENERATED" && (
                    <div className="grid">
                        <p className="text-md">{offerDocument.displayName ?? `v${offerDocument.version}`}</p>
                        <p className="text-sm text-(--text-secondary)">{offerDocument.status}</p>
                    </div>
                )}

                {status === "FAILED" && (
                    <div className="grid">
                        <p className="text-md">FAILED</p>
                    </div>
                )}

                {(status === "PENDING" || status === "PROCESSING") && (
                    <div className="grid">
                        <LoaderCircle className="size-4 animate-spin" />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-2">
                <Button variant="secondary" size="sm" icon={<UploadCloud className="size-3.5" />} iconOnly
                    onClick={() => upload({ offerId: offerDocument.offerId, documentId: offerDocument.id })} loading={isUploading} disabled={status === "UPLOADED"} />

                <Button variant="secondary" size="sm" icon={<Trash className="size-3.5" />} iconOnly
                    onClick={() => deleteDocument({ offerId: offerDocument.offerId, documentId: offerDocument.id })} loading={isDeletingDocument || !!errorDeletingDocument} disabled={isDeletingDocument || !!errorDeletingDocument} />
            </div>
        </div>
    )
}
