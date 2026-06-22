import { Button } from "@/components";
import { useDocumentTask, useOfferHook } from "@/hooks";
import { BASE_URL } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { formatBytesToKB } from "@/lib/utils";
import type { DocumentStatus, OfferDocument } from "@/types"
import { Download, File, LoaderCircle, Trash, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

type Props = {
    offerDocument: OfferDocument;
}

export default function OfferCardDocument({ offerDocument }: Props) {
    const { offerId } = offerDocument;

    const [status, setStatus] = useState<DocumentStatus>(offerDocument.status);
    const { task: polledTask } = useDocumentTask(offerDocument.taskId);

    const {
        deleteDocument,
        isDeletingDocument,
        errorDeletingDocument,
        upload,
        isUploading,
        errorUploading
    } = useOfferHook();

    useEffect(() => {
        if (polledTask?.status === "COMPLETED") {
            setStatus("GENERATED");
            console.log("setStatus")
        }
    }, [polledTask?.status]);

    useEffect(() => {
        if (errorUploading) {
            toast.error(errorUploading.message)
        }
    }, [errorDeletingDocument, errorUploading]);

    console.log(status, offerDocument.status)

    return (
        <div className="flex items-center justify-between py-3 border-b border-(--border) last:border-0">
            <div className="w-full flex items-center gap-4">
                {status === "GENERATED" && (
                    <div className="grid gap-0.5">
                        <p className="text-md">{offerDocument.displayName ?? `v${offerDocument.version}`}</p>
                        <div className="flex items-center gap-2 text-sm">
                            <p><span className="text-(--text-secondary)">size: </span> {formatBytesToKB(offerDocument.pdf?.size || 0)}</p>
                            <p><span className="text-(--text-secondary)">status: </span> {offerDocument.status}</p>
                            <p><span className="text-(--text-secondary)">created: </span> {formatDate(offerDocument.createdAt)}</p>
                        </div>
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

            <div className="flex items-center ">
                {status === "GENERATED" && (
                    <>
                        <a href={`${BASE_URL}/api/offers/${offerId}/documents/${offerDocument.id}/pdf`} download>
                            <Button variant="ghost" size="sm" icon={<Download className="size-4" />} iconOnly title="PDF herunterladen" />
                        </a>
                        <a href={`${BASE_URL}/api/offers/${offerId}/documents/${offerDocument.id}/docx`} download>
                            <Button variant="ghost" size="sm" icon={<File className="size-4" />} iconOnly title="DOCX herunterladen" />
                        </a>
                    </>
                )}
                <Button variant="ghost" size="sm" icon={<UploadCloud className="size-4" />} iconOnly
                    onClick={() => upload({ offerId: offerDocument.offerId, documentId: offerDocument.id })} loading={isUploading}
                    disabled={status === "UPLOADED"}
                />

                <Button variant="ghost" size="sm" icon={<Trash className="size-4" />} iconOnly
                    onClick={() => deleteDocument({ offerId: offerDocument.offerId, documentId: offerDocument.id })}
                    loading={isDeletingDocument || !!errorDeletingDocument}
                    disabled={isDeletingDocument || !!errorDeletingDocument}
                />
            </div>
        </div>
    )
}
