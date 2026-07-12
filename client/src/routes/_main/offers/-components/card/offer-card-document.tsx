import { Button } from "@/components";
import { useDocumentTask } from "@/hooks";
import { useDeleteOfferDocument, useOfferDocumentUpload } from "@/hooks/offers/offer-mutations";
import { BASE_URL } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { formatBytesToKB } from "@/lib/utils";
import type { OfferDocument } from "@/types";
import { Download, File, LoaderCircle, Trash, UploadCloud } from "lucide-react";
import { useEffect } from "react";
import { toast } from "react-toastify";

type Props = {
    offerDocument: OfferDocument;
}

export default function OfferCardDocument({ offerDocument }: Props) {
    const { offerId, status, taskId } = offerDocument;

    useDocumentTask(taskId);

    const {
        uploadOfferDocument,
        isUploading,
        errorUploading,
    } = useOfferDocumentUpload();

    const { deleteOfferDocument, isDeleting, errorDeleting } = useDeleteOfferDocument();

    useEffect(() => {
        if (errorUploading) {
            toast.error(errorUploading.message);
        }

        if (errorDeleting) {
            toast.error(errorDeleting.message);
        }
    }, [errorDeleting, errorUploading]);

    return (
        <div className="flex items-center justify-between py-3 border-b border-(--border) last:border-0">
            <div className="w-full flex items-center gap-4">
                <div className="grid gap-0.5">
                    <p className="text-md">{offerDocument.displayName ?? `v${offerDocument.version}`}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <p><span className="text-(--text-secondary)">docx-size: </span> {formatBytesToKB(offerDocument.docx?.size || 0)}</p>
                        <p><span className="text-(--text-secondary)">pdf-size: </span> {formatBytesToKB(offerDocument.pdf?.size || 0)}</p>
                        <p><span className="text-(--text-secondary)">status: </span> {status}</p>
                        <p><span className="text-(--text-secondary)">created: </span> {formatDate(offerDocument.createdAt)}</p>
                    </div>
                </div>

                {status === "FAILED" && (
                    <div className="grid">
                        <p className="text-md">FAILED</p>
                    </div>
                )}
            </div>

            <div className="flex items-center ">
                {(status === "GENERATED" || status === "UPLOADED" || status === "UPLOADING") && (
                    <>
                        <a href={`${BASE_URL}/api/offers/${offerId}/documents/${offerDocument.id}/pdf`} download>
                            <Button variant="ghost" size="sm" icon={<Download className="size-4" />} iconOnly title="PDF herunterladen" />
                        </a>
                        <a href={`${BASE_URL}/api/offers/${offerId}/documents/${offerDocument.id}/docx`} download>
                            <Button variant="ghost" size="sm" icon={<File className="size-4" />} iconOnly title="DOCX herunterladen" />
                        </a>
                    </>
                )}

                {(status === "GENERATED" || status === "UPLOADED" || status === "UPLOADING") && (
                    <>
                        <Button variant="ghost" size="sm" icon={<UploadCloud className="size-4" />} iconOnly
                            onClick={() => uploadOfferDocument({ offerId: offerDocument.offerId, documentId: offerDocument.id })} loading={isUploading}
                            disabled={status === "UPLOADED"}
                        />

                        <Button variant="ghost" size="sm" icon={<Trash className="size-4" />} iconOnly
                            onClick={() => deleteOfferDocument({ offerId: offerDocument.offerId, documentId: offerDocument.id })}
                            loading={isDeleting || !!errorDeleting}
                            disabled={isDeleting || !!errorDeleting}
                        />
                    </>
                )}

                {(status === "FAILED" && (
                    <>
                        <Button variant="ghost" size="sm" icon={<Trash className="size-4" />} iconOnly
                            onClick={() => deleteOfferDocument({ offerId: offerDocument.offerId, documentId: offerDocument.id })}
                            loading={isDeleting || !!errorDeleting}
                            disabled={isDeleting || !!errorDeleting}
                        />
                    </>
                ))}

                {(status === "PENDING" || status === "PROCESSING") && (
                    <div className="grid">
                        <LoaderCircle className="size-4 animate-spin" />
                    </div>
                )}

            </div>
        </div>
    )
}
