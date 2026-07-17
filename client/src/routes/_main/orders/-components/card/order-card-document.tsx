import { Download, File, LoaderCircle, Pencil, Trash, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import type { OrderDocument } from "@/types";
import { findDocumentArtifact } from "@/types";
import { Button, DocumentRenameModal } from "@/components";
import { useDocumentMutations, useDocumentTask } from "@/hooks";
import { documentDownloadUrl } from "@/data/documents";
import { formatDate } from "@/lib/format";
import { formatBytesToKB } from "@/lib/utils";

type Props = {
    orderDocument: OrderDocument;
}

export default function OrderCardDocument({ orderDocument }: Props) {
    const { id, orderId, status, taskId, displayName, version, createdAt } = orderDocument;
    const { t } = useTranslation();
    const [renameOpen, setRenameOpen] = useState(false);
    const pdf = findDocumentArtifact(orderDocument.artifacts, "PDF");
    const docx = findDocumentArtifact(orderDocument.artifacts, "DOCX");
    const {
        uploadDocument,
        isUploadingDocument,
        errorUploadingDocument,
        deleteDocument,
        isDeletingDocument,
        errorDeletingDocument,
        renameDocument,
        isRenamingDocument,
        errorRenamingDocument,
    } = useDocumentMutations("order", orderId);

    useDocumentTask(taskId);

    useEffect(() => {
        if (errorUploadingDocument) toast.error(errorUploadingDocument.message);
        if (errorDeletingDocument) toast.error(errorDeletingDocument.message);
        if (errorRenamingDocument) toast.error(errorRenamingDocument.message);
    }, [errorDeletingDocument, errorRenamingDocument, errorUploadingDocument]);

    return (
        <div className="flex items-center justify-between py-3 border-b border-(--border) last:border-0">
            <div className="w-full flex items-center gap-4">
                <div className="grid gap-0.5">
                    <p className="text-md">{displayName ?? `v${version}`}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <p><span className="text-(--text-secondary)">docx-size: </span> {formatBytesToKB(docx?.size || 0)}</p>
                        <p><span className="text-(--text-secondary)">pdf-size: </span> {formatBytesToKB(pdf?.size || 0)}</p>
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
                        <a href={documentDownloadUrl("order", id, "pdf")} download>
                            <Button variant="ghost" size="sm" icon={<Download className="size-4" />} iconOnly title="PDF herunterladen" />
                        </a>
                        <a href={documentDownloadUrl("order", id, "docx")} download>
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
                        onClick={() => deleteDocument(id)}
                        loading={isDeletingDocument}
                        disabled={isDeletingDocument}
                    />
                )}

                {(status === "GENERATED" || status === "UPLOADED" || status === "UPLOADING") && (
                        <Button variant="ghost" size="sm" icon={<UploadCloud className="size-4" />} iconOnly
                        onClick={() => uploadDocument(id)}
                        loading={isUploadingDocument}
                        disabled={status === "UPLOADED" || isUploadingDocument}
                    />
                )}

                {(status === "GENERATED" || status === "UPLOADED") && (
                    <Button variant="ghost" size="sm" icon={<Pencil className="size-4" />} iconOnly
                        title="Dokument umbenennen" onClick={() => setRenameOpen(true)} />
                )}

                {(status === "PENDING" || status === "PROCESSING") && (
                    <div className="grid">
                        <LoaderCircle className="size-4 animate-spin" />
                    </div>
                )}

            </div>
            {renameOpen && (
                <DocumentRenameModal
                    initialValue={displayName ?? `v${version}`}
                    isPending={isRenamingDocument}
                    onClose={() => setRenameOpen(false)}
                    onSubmit={(nextDisplayName) => renameDocument({ documentId: id, displayName: nextDisplayName })}
                />
            )}
        </div>
    );
}
