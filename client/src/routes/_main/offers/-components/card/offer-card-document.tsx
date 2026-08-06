import { Download, ExternalLink, File, LoaderCircle, Pencil, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { findDocumentArtifact } from "@keepit/schemas";
import type { OfferDocument } from "@keepit/schemas";
import { ActionMenu, Button, DocumentRenameModal, showToast } from "@/components";
import { useDocumentMutations, useDocumentTask } from "@/hooks";
import { documentDownloadUrl } from "@/data/documents";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { formatBytesToKB } from "@/lib/utils";

type Props = {
    offerDocument: OfferDocument;
}

export default function OfferCardDocument({ offerDocument }: Props) {
    const { t } = useTranslation();
    const { offerId, status, taskId } = offerDocument;
    const [renameOpen, setRenameOpen] = useState(false);
    const pdf = findDocumentArtifact(offerDocument.artifacts, "PDF");
    const docx = findDocumentArtifact(offerDocument.artifacts, "DOCX");

    useDocumentTask(taskId);

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
    } = useDocumentMutations("offer", offerId);

    useEffect(() => {
        if (errorUploadingDocument) showToast.error("offers.toast.documentUploadError", { vars: { message: getErrorMessage(errorUploadingDocument) } });
        if (errorDeletingDocument) showToast.error("offers.toast.documentDeleteError", { vars: { message: getErrorMessage(errorDeletingDocument) } });
        if (errorRenamingDocument) showToast.error("offers.toast.documentRenameError", { vars: { message: getErrorMessage(errorRenamingDocument) } });
    }, [errorDeletingDocument, errorRenamingDocument, errorUploadingDocument]);

    return (
        <div className="flex items-center justify-between py-3 border-b border-(--border) last:border-0">
            <div className="w-full flex items-center gap-4">
                <div className="grid gap-0.5">
                    <p className="text-md">{offerDocument.displayName ?? `v${offerDocument.version}`}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <p><span className="text-(--text-secondary)">docx-size: </span> {formatBytesToKB(docx?.size || 0)}</p>
                        <p><span className="text-(--text-secondary)">pdf-size: </span> {formatBytesToKB(pdf?.size || 0)}</p>
                        <p><span className="text-(--text-secondary)">status: </span> {status}</p>
                        <p><span className="text-(--text-secondary)">created: </span> {formatDate(offerDocument.createdAt)}</p>
                        {offerDocument.sourceVersion && <p>{t("versionHistory.sourceVersion", { version: offerDocument.sourceVersion })}</p>}
                        <p className={offerDocument.isCurrent ? "text-green-700" : "text-(--text-secondary)"}>
                            {offerDocument.isCurrent ? t("versionHistory.currentDocument") : t("versionHistory.historicalDocument")}
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
                    <Button variant="ghost" size="sm" icon={<UploadCloud className="size-4" />} iconOnly
                        onClick={() => uploadDocument(offerDocument.id)} loading={isUploadingDocument}
                        disabled={status === "UPLOADED" || isUploadingDocument}
                    />
                )}

                {(status === "PENDING" || status === "PROCESSING") && (
                    <div className="grid">
                        <LoaderCircle className="size-4 animate-spin" />
                    </div>
                )}

                {(status !== "PENDING" && status !== "PROCESSING") && (
                    <>
                        <ActionMenu
                            label="Downloads"
                            icon={<Download size={14} />}
                            items={[
                                {
                                    label: "PDF herunterladen",
                                    icon: <Download size={14} />,
                                    href: documentDownloadUrl("offer", offerDocument.id, "pdf"),
                                    download: "",
                                    condition: status === "GENERATED" || status === "UPLOADED" || status === "UPLOADING"
                                },
                                {
                                    label: "DOCX herunterladen",
                                    icon: <File size={14} />,
                                    href: documentDownloadUrl("offer", offerDocument.id, "docx"),
                                    download: "",
                                    condition: status === "GENERATED" || status === "UPLOADED" || status === "UPLOADING"
                                },
                            ]}
                        />

                        <ActionMenu
                            label="Aktionen"
                            items={[
                                {
                                    label: "In NextCloud ansehen",
                                    icon: <ExternalLink className="size-3.5" />,
                                    onSelect: () => { },
                                    condition: status === "FAILED",
                                },
                                {
                                    label: "Bearbeiten",
                                    icon: <Pencil className="size-3.5" />,
                                    onSelect: () => setRenameOpen(true),
                                    // Auch nach dem Upload: das Umbenennen verschiebt die
                                    // Dateien auf Nextcloud mit.
                                    condition: status === "GENERATED" || status === "UPLOADED"
                                },
                                {
                                    label: "Löschen",
                                    icon: <Trash2 className="size-3.5" />,
                                    danger: true,
                                    disabled: isDeletingDocument,
                                    onSelect: () => deleteDocument(offerDocument.id),
                                    condition: status === "GENERATED" || status === "UPLOADED" || status === "FAILED"
                                },
                            ]}
                        />
                    </>
                )}
            </div>
            {renameOpen && (
                <DocumentRenameModal
                    initialValue={offerDocument.displayName ?? `v${offerDocument.version}`}
                    isPending={isRenamingDocument}
                    onClose={() => setRenameOpen(false)}
                    onSubmit={(displayName) => renameDocument({ documentId: offerDocument.id, displayName })}
                />
            )}
        </div>
    )
}
