import { Download, File, LoaderCircle, Trash, UploadCloud } from "lucide-react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { OrderDocument } from "@/types";
import { Button } from "@/components";
import { useDocumentTask, useOrderHook } from "@/hooks";
import { BASE_URL } from "@/lib/api-client";
import { formatDate } from "@/lib/format";
import { formatBytesToKB } from "@/lib/utils";

type Props = {
    orderDocument: OrderDocument;
}

export default function OrderCardDocument({ orderDocument }: Props) {
    const { id, orderId, status, taskId, displayName, version, pdf, createdAt } = orderDocument;
    const { t } = useTranslation();
    const {
        uploadDocument,
        isUploadingDocument,
        errorUploadingDocument,
        deleteDocument,
        isDeletingDocument,
        errorDeletingDocument,
    } = useOrderHook();

    useDocumentTask(taskId);

    useEffect(() => {
        if (errorUploadingDocument) toast.error(errorUploadingDocument.message);
        if (errorDeletingDocument) toast.error(errorDeletingDocument.message);
    }, [errorDeletingDocument, errorUploadingDocument]);

    return (
        <div className="flex items-center justify-between py-3 border-b border-(--border) last:border-0">
            <div className="w-full flex items-center gap-4">
                <div className="grid gap-0.5">
                    <p className="text-md">{displayName ?? `v${version}`}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <p><span className="text-(--text-secondary)">size: </span> {formatBytesToKB(pdf?.size || 0)}</p>
                        <p><span className="text-(--text-secondary)">status: </span> {status}</p>
                        <p><span className="text-(--text-secondary)">created: </span> {formatDate(createdAt)}</p>
                        {orderDocument.sourceVersion && <p>{t("versionHistory.sourceVersion", { version: orderDocument.sourceVersion })}</p>}
                        <p className={orderDocument.isCurrent ? "text-green-700" : "text-(--text-secondary)"}>
                            {orderDocument.isCurrent ? t("versionHistory.currentDocument") : t("versionHistory.historicalDocument")}
                        </p>
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
                        <a href={`${BASE_URL}/api/orders/${orderId}/documents/${id}/pdf`} download>
                            <Button variant="ghost" size="sm" icon={<Download className="size-4" />} iconOnly title="PDF herunterladen" />
                        </a>
                        <a href={`${BASE_URL}/api/orders/${orderId}/documents/${id}/docx`} download>
                            <Button variant="ghost" size="sm" icon={<File className="size-4" />} iconOnly title="DOCX herunterladen" />
                        </a>
                    </>
                )}

                {(status === "GENERATED" || status === "UPLOADED" || status === "FAILED") && (
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<Trash className="size-4" />}
                        iconOnly
                        title="Dokument löschen"
                        onClick={() => deleteDocument({ orderId, documentId: id })}
                        loading={isDeletingDocument}
                        disabled={isDeletingDocument}
                    />
                )}

                {(status === "GENERATED" || status === "UPLOADED" || status === "UPLOADING") && (
                    <Button variant="ghost" size="sm" icon={<UploadCloud className="size-4" />} iconOnly
                        onClick={() => uploadDocument({ orderId, documentId: id })}
                        loading={isUploadingDocument}
                        disabled={status === "UPLOADED" || isUploadingDocument}
                    />
                )}

                {(status === "PENDING" || status === "PROCESSING") && (
                    <div className="grid">
                        <LoaderCircle className="size-4 animate-spin" />
                    </div>
                )}

            </div>
        </div>
    );
}
