import { Download, ExternalLink, File, LoaderCircle, Pencil, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { findDocumentArtifact, hasOutdatedRemote } from "@keepit/schemas";
import { useDropzone } from 'react-dropzone';
import { tv } from "tailwind-variants";
import type { OfferDocument } from "@keepit/schemas";
import { ActionMenu, Button, DocumentRenameModal, showToast } from "@/components";
import { useDocumentMutations, useDocumentTask, useLocale } from "@/hooks";
import { documentDownloadUrl } from "@/data/documents";
import { getErrorMessage } from "@/lib/errors";
import { formatDate } from "@/lib/format";
import { formatBytesToKB } from "@/lib/utils";

type Props = {
    offerDocument: OfferDocument;
}

const styles = tv({
    base: [
        'relative flex items-center justify-between py-3',
        'border-b border-(--border) last:border-0 bg-white'
    ],
    variants: {
        isFocused: {
            true: 'outline outline-blue-500 opacity-0',
            false: ''
        },
        isDragAccept: {
            true: 'outline outline-green-500 opacity-0',
            false: ''
        },
        isDragReject: {
            true: 'outline outline-red-500 opacity-0',
            false: ''
        },
    }
});

export default function OfferCardDocument({ offerDocument }: Props) {
    const { t } = useTranslation();
    const locales = useLocale()

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
        replaceDocumentFile,
        isReplacingDocumentFile,
        errorReplacingDocumentFile,
        resyncDocument,
        isResyncingDocument,
        errorResyncingDocument,
    } = useDocumentMutations("offer", offerId);

    // Ersetzen setzt ein vorhandenes Artefakt voraus; währenddessen darf nichts
    // Weiteres fallengelassen werden.
    const canReplace = (status === "GENERATED" || status === "UPLOADED") && !isReplacingDocumentFile;

    // Die Datei in S3 wurde ersetzt, auf Nextcloud liegt noch der alte Stand.
    const remoteOutdated = hasOutdatedRemote(offerDocument.artifacts);

    const {
        getRootProps,
        getInputProps,
        isFocused,
        isDragAccept,
        isDragReject,
    } = useDropzone({
        accept: { "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [] },
        noKeyboard: true,
        noClick: true,
        multiple: false,
        disabled: !canReplace,
        onDrop: (acceptedFiles) => {
            // Wird auch aufgerufen, wenn alle Dateien abgelehnt wurden — der Typ
            // sagt File[], zur Laufzeit ist die Liste dann leer.
            const [file] = acceptedFiles;
            if (acceptedFiles.length === 0) return;

            replaceDocumentFile({ documentId: offerDocument.id, format: "docx", file });
        },
    });

    useEffect(() => {
        if (errorUploadingDocument) showToast.error("offers.toast.documentUploadError", { vars: { message: getErrorMessage(errorUploadingDocument) } });
        if (errorDeletingDocument) showToast.error("offers.toast.documentDeleteError", { vars: { message: getErrorMessage(errorDeletingDocument) } });
        if (errorRenamingDocument) showToast.error("offers.toast.documentRenameError", { vars: { message: getErrorMessage(errorRenamingDocument) } });
        if (errorReplacingDocumentFile) showToast.error(getErrorMessage(errorReplacingDocumentFile));
        if (errorResyncingDocument) showToast.error(getErrorMessage(errorResyncingDocument));
    }, [errorDeletingDocument, errorRenamingDocument, errorUploadingDocument, errorReplacingDocumentFile, errorResyncingDocument]);

    return (
        <div className="relative h-fit">
            {isDragAccept && (
                <div className="absolute flex items-center justify-center top-0 left-0 w-full h-full">
                    <p className="text-sm uppercase text-gray-500">Replace generated file!</p>
                </div>
            )}

            {isDragReject && (
                <div className="absolute flex items-center justify-center top-0 left-0 w-full h-full">
                    <p className="text-sm uppercase text-red-500">This is the wrong file format!</p>
                </div>
            )}

            <div {...getRootProps()} className={styles({ isFocused, isDragAccept, isDragReject })}>
                <input {...getInputProps()} className="z-100" />

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

                        {remoteOutdated && (
                            <p className="text-sm text-amber-700">
                                Weicht von der Datei in NextCloud ab.
                            </p>
                        )}
                    </div>

                    {status === "FAILED" && (
                        <div className="grid">
                            <p className="text-md">FAILED</p>
                        </div>
                    )}
                </div>

                <div className="flex items-center ">
                    {isReplacingDocumentFile && (
                        <LoaderCircle className="size-4 animate-spin" />
                    )}

                    {/* Ersetzt die Datei auf NextCloud durch den neuen Stand. */}
                    {remoteOutdated && (
                        <Button variant="ghost" size="sm" icon={<RefreshCw className="size-4" />} iconOnly
                            title="NextCloud aktualisieren"
                            onClick={() => resyncDocument(offerDocument.id)}
                            loading={isResyncingDocument} disabled={isResyncingDocument}
                        />
                    )}

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



        </div>
    )
}
