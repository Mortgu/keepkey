import { Menu } from "@base-ui/react";
import { findDocumentArtifact, hasOutdatedRemote } from "@keepit/schemas";
import { Download, EllipsisVertical, ExternalLink, Eye, File as FileIcon, Info, LoaderCircle, Pen, Pencil, RefreshCw, Replace, Trash2, UploadCloud, X } from "lucide-react";
import React from "react";
import { useTranslation } from "react-i18next";
import { DocumentEditModal, DocumentPreviewModal, DocumentRenameModal } from "./modals";
import type { useDropzone } from "react-dropzone";
import type { ConfirmationDocument, DocumentStatus, DocumentType, InvoiceDocument, OfferDocument, OrderDocument } from "@keepit/schemas";
import type { ReactNode } from "react";
import { documentDownloadUrl, replaceBlockerMessage, useDocumentCapabilities, useDocumentMutations, useDocumentTask, useFormatters, useLocale, useModal } from "@/hooks";
import { Badge, Button, Tooltip, menuStyles } from "@/components/elements";
import useDocumentDropzone from "@/hooks/documents/document-dropzone";
import { getDocumentStatus } from "@/utils/status";
import { formatBytesToKB } from "@/lib/utils";

type CardDocument = OfferDocument | OrderDocument | ConfirmationDocument | InvoiceDocument;

type Props = {
    /** Woran das Dokument hängt — steuert Endpunkte und Cache-Keys. */
    type: DocumentType;
    document: CardDocument;
    /** Id des Angebots bzw. der Bestellung. */
    parentId: string;
    /** Das Elternobjekt ist eingefroren (z.B. ein angenommenes Angebot) — Edit/Rename/Delete/Replace sind gesperrt. */
    locked?: boolean;
};

export default function DocumentCard({ type, document, parentId, locked = false }: Props) {
    const { t } = useTranslation();
    const { formatDate } = useFormatters();

    useDocumentTask(document.taskId);

    /* Physical files / Artifacts */
    const PDF_ARTIFACT = findDocumentArtifact(document.artifacts, "PDF");
    const DOCX_ARTIFACT = findDocumentArtifact(document.artifacts, "DOCX");

    const documentMutations = useDocumentMutations(type, parentId);

    /* General check whether replacing files is possible in this environment. */
    const { canReplaceFiles, replaceBlocker } = useDocumentCapabilities();
    const remoteOutdated = hasOutdatedRemote(document.artifacts);

    const documentHasArtifacts = document.status === "GENERATED" || document.status === "UPLOADED";
    const canReplaceDocument =
        documentHasArtifacts &&
        canReplaceFiles &&
        !documentMutations.isReplacingDocumentFile &&
        !locked;

    // Gespeichert wird über denselben Weg wie beim Ersetzen.
    const canEditDocument = canReplaceDocument && Boolean(DOCX_ARTIFACT);
    const canPreviewDocument = documentHasArtifacts && Boolean(PDF_ARTIFACT);

    /* Begründung für gesperrte Aktionen, als `title` am Menüpunkt. */
    const lockedHint = locked ? t("orders.acceptedHint") : undefined;
    const replaceHint = lockedHint ?? (canReplaceFiles ? undefined : replaceBlockerMessage(replaceBlocker));

    const documentRenameModal = useModal();
    const documentPreviewModal = useModal();
    const documentEditModal = useModal();

    const replaceDocument = (replacement: File) => documentMutations.replaceDocumentFile({
        documentId: document.id,
        format: "docx",
        file: replacement
    });

    const { dropzone } = useDocumentDropzone({
        disabled: !canReplaceDocument,
        replaceDocument,
    });

    const isBusy =
        document.status === "PENDING" ||
        document.status === "PROCESSING" ||
        documentMutations.isReplacingDocumentFile;

    return (
        <React.Fragment>
            {/* Card */}
            <DocumentDropzone dropzone={dropzone}>
                <div data-locked={locked} className="grid grid-cols-[1fr_auto] items-center justify-between border-b border-(--border) last:border-b-0 text-sm">
                    <div className="grid gap-1 px-4 py-3">
                        <div className="flex items-center gap-2">
                            {document.isCurrent && (
                                <Tooltip side="top" content={t("documents.card.current")}>
                                    <div className="w-1.5 h-1.5 rounded-full bg-(--primary-600)" />
                                </Tooltip>
                            )}
                            <p className="font-medium">{document.displayName}</p>
                            <DocumentInfo
                                docxSize={DOCX_ARTIFACT?.size}
                                pdfSize={PDF_ARTIFACT?.size}
                                sourceVersion={document.sourceVersion}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-(--fg-3)">{formatDate(document.createdAt)}</p>
                            <DocumentStatusBadge status={document.status} remoteOutdated={remoteOutdated} />
                        </div>
                    </div>

                    {!isBusy && (
                        <div className="flex items-center justify-end px-4 py-3">
                            {(document.status === "GENERATED" || document.status === "UPLOADING" || remoteOutdated) && (
                                <DocumentUploadMenu
                                    uploadDocument={() => documentMutations.uploadDocument(document.id)}
                                    resyncDocument={() => documentMutations.resyncDocument(document.id)}
                                    isUploadingDocument={documentMutations.isUploadingDocument}
                                    isResyncingDocument={documentMutations.isResyncingDocument}
                                    status={document.status}
                                    remoteOutdated={remoteOutdated}
                                />
                            )}

                            {documentHasArtifacts && (
                                <DocumentDownloadMenu
                                    docx={documentDownloadUrl(type, document.id, "docx")}
                                    pdf={documentDownloadUrl(type, document.id, "pdf")}
                                />
                            )}

                            {document.status !== "UPLOADING" && (
                                <DocumentMenu
                                    canReplaceDocument={canReplaceDocument}
                                    // react-dropzone liefert zur Laufzeit `open: null`, solange die
                                    // Zone deaktiviert ist — entgegen seiner Typen.
                                    replaceDocument={() => { if (canReplaceDocument) dropzone.open(); }}
                                    replaceHint={replaceHint}

                                    canModifyDocument={!locked}
                                    lockedHint={lockedHint}
                                    deleteDocument={() => documentMutations.deleteDocument(document.id)}
                                    renameDocument={documentRenameModal.open}

                                    previewDocument={documentPreviewModal.open}
                                    canPreviewDocument={canPreviewDocument}

                                    canEditDocument={canEditDocument}
                                    openDocxEditor={documentEditModal.open}
                                />
                            )}
                        </div>
                    )}

                    {isBusy && (
                        <div className="px-4 py-3 text-right">
                            <LoaderCircle className="animate-spin" size={16} />
                        </div>
                    )}
                </div>
            </DocumentDropzone>

            {/* Modals */}
            {documentRenameModal.isOpen && (
                <DocumentRenameModal
                    key={documentRenameModal.key}
                    onClose={documentRenameModal.close}
                    isPending={documentMutations.isRenamingDocument}
                    initialValue={document.displayName ?? `v${document.version}`}
                    onSubmit={(displayName) => documentMutations.renameDocument({
                        documentId: document.id,
                        displayName: displayName
                    })}
                />
            )}

            {documentPreviewModal.isOpen && PDF_ARTIFACT && (
                <DocumentPreviewModal
                    type={type}
                    documentId={document.id}
                    artifactId={PDF_ARTIFACT.id}
                    title={document.displayName ?? `v${document.version}`}
                    onClose={documentPreviewModal.close}
                />
            )}

            {documentEditModal.isOpen && DOCX_ARTIFACT && (
                <DocumentEditModal
                    key={documentEditModal.key}
                    type={type}
                    documentId={document.id}
                    artifactId={DOCX_ARTIFACT.id}
                    displayName={document.displayName ?? `${document.id}.docx`}
                    onClose={documentEditModal.close}
                    onSave={replaceDocument}
                />
            )}
        </React.Fragment>
    )
}

interface MenuProps {
    canReplaceDocument: boolean;
    replaceDocument: () => void;
    replaceHint?: string;

    /* Rename + delete */
    canModifyDocument: boolean;
    lockedHint?: string;
    deleteDocument: () => void;
    renameDocument: () => void;

    previewDocument: () => void;
    canPreviewDocument: boolean;

    canEditDocument: boolean;
    openDocxEditor: () => void;
};

const DocumentMenu = ({
    canReplaceDocument,
    replaceDocument,
    replaceHint,
    canModifyDocument,
    lockedHint,
    deleteDocument,
    renameDocument,
    previewDocument,
    canPreviewDocument,
    canEditDocument,
    openDocxEditor,
}: MenuProps) => {
    const { t } = useTranslation();
    const styles = menuStyles();

    return (
        <Menu.Root>
            <Menu.Trigger
                className={styles.Trigger()}
                render={
                    <Button
                        size="xs"
                        variant="ghost"
                        icon={<EllipsisVertical size={14} />}
                        iconOnly
                    />
                }
            />

            <Menu.Portal>
                <Menu.Positioner className={styles.Positioner()} align="end">
                    <Menu.Popup className={styles.Popup()}>

                        {/* View in NextCloud */}
                        <Menu.Item className={styles.Item()} disabled>
                            <ExternalLink size={14} /> {t("documents.actions.viewInNextcloud")}
                        </Menu.Item>

                        {/* File replacement */}
                        <Menu.Item
                            className={styles.Item()}
                            disabled={!canReplaceDocument}
                            title={canReplaceDocument ? undefined : replaceHint}
                            onClick={() => replaceDocument()}
                        >
                            <Replace size={14} /> {t("documents.actions.replace")}
                        </Menu.Item>

                        {/* File preview */}
                        <Menu.Item className={styles.Item()} disabled={!canPreviewDocument} onClick={() => previewDocument()}>
                            <Eye size={14} /> {t("documents.actions.preview")}
                        </Menu.Item>

                        {/* File rename */}
                        <Menu.Item
                            className={styles.Item()}
                            disabled={!canModifyDocument}
                            title={canModifyDocument ? undefined : lockedHint}
                            onClick={() => renameDocument()}
                        >
                            <Pen size={14} /> {t("documents.actions.rename")}
                        </Menu.Item>

                        {/* File edit */}
                        <Menu.Item
                            className={styles.Item()}
                            disabled={!canEditDocument}
                            title={canEditDocument ? undefined : replaceHint}
                            onClick={() => openDocxEditor()}
                        >
                            <Pencil size={14} /> {t("documents.actions.edit")}
                        </Menu.Item>

                        {/* File delete */}
                        <Menu.Item
                            className={styles.Item()}
                            disabled={!canModifyDocument}
                            title={canModifyDocument ? undefined : lockedHint}
                            onClick={deleteDocument}
                            data-danger
                        >
                            <Trash2 size={14} /> {t("documents.actions.delete")}
                        </Menu.Item>

                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    )
}

interface DownloadMenuProps {
    docx: string;
    pdf: string;
};

const DocumentDownloadMenu = ({ docx, pdf }: DownloadMenuProps) => {
    const { t } = useTranslation();
    const styles = menuStyles();

    return (
        <Menu.Root>
            <Menu.Trigger
                className={styles.Trigger()}
                render={
                    <Button
                        size="xs"
                        variant="ghost"
                        icon={<Download size={14} />}
                        iconOnly
                    />
                }
            />

            <Menu.Portal>
                <Menu.Positioner className={styles.Positioner()} align="end">
                    <Menu.Popup className={styles.Popup()}>

                        {/* Download DOCX */}
                        <Menu.Item className={styles.Item()} onClick={() => window.location.assign(docx)}>
                            <Download size={14} /> {t("documents.actions.downloadDocx")}
                        </Menu.Item>

                        {/* Download PDF */}
                        <Menu.Item className={styles.Item()} onClick={() => window.location.assign(pdf)}>
                            <Download size={14} /> {t("documents.actions.downloadPdf")}
                        </Menu.Item>

                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    );
}

interface UploadMenuProps {
    uploadDocument: () => void;
    resyncDocument: () => void;

    isUploadingDocument: boolean;
    isResyncingDocument: boolean;
    status: DocumentStatus;
    remoteOutdated: boolean;
};

const DocumentUploadMenu = ({
    uploadDocument,
    resyncDocument,

    isUploadingDocument,
    isResyncingDocument,
    status,
    remoteOutdated
}: UploadMenuProps) => {
    const { t } = useTranslation();

    return (
        <React.Fragment>
            {!remoteOutdated && (
                <Button
                    variant="ghost"
                    size="xs"
                    icon={<UploadCloud size={14} strokeWidth={2} />}
                    iconOnly
                    title={t("documents.actions.upload")}
                    onClick={() => uploadDocument()}
                    loading={isUploadingDocument}
                    disabled={status === "UPLOADING"}
                />
            )}

            {remoteOutdated && (
                <div className="flex items-center border-r border-(--border) pr-4 mr-2">
                    <Button
                        variant="ghost"
                        size="xs"
                        icon={<RefreshCw size={14} strokeWidth={2} />}
                        iconOnly
                        title={t("documents.actions.resync")}
                        onClick={() => resyncDocument()}
                        loading={isResyncingDocument}
                        disabled={isResyncingDocument}
                    />

                    {/* TODO: MAKE FUNCTIONAL */}
                    <Button
                        variant="ghost"
                        size="sm"
                        icon={<X size={18} strokeWidth={2.2} />}
                        iconOnly
                        disabled
                    />
                </div>
            )}
        </React.Fragment>
    );
}

interface StatusBadgeProps {
    status: DocumentStatus;
    remoteOutdated: boolean;
};

const DocumentStatusBadge = ({ status, remoteOutdated }: StatusBadgeProps) => {
    const { t } = useTranslation();
    const locale = useLocale();

    if (remoteOutdated) {
        return (
            <Tooltip content={t("documents.card.outOfSyncHint")}>
                <Badge variant="FAILED">{t("documents.card.outOfSync")}</Badge>
            </Tooltip>
        );
    }

    return (
        <Tooltip content={getDocumentStatus(status, locale, "description")}>
            <Badge variant={status}>{getDocumentStatus(status, locale, "value")}</Badge>
        </Tooltip>
    );
}

interface InfoProps {
    docxSize?: number;
    pdfSize?: number;
    sourceVersion: CardDocument["sourceVersion"];
};

const DocumentInfo = ({ docxSize, pdfSize, sourceVersion }: InfoProps) => {
    const { t } = useTranslation();

    return (
        <Tooltip
            side="right"
            content={
                <div className="grid">
                    <p>DOCX: <b>{formatBytesToKB(docxSize ?? 0)}</b></p>
                    <p>PDF: <b>{formatBytesToKB(pdfSize ?? 0)}</b></p>
                    <p>{t("documents.card.version")}: <b>{sourceVersion}</b></p>
                </div>
            }
        >
            <Info size={14} className="text-(--fg-3) hover:text-(--fg-2)" />
        </Tooltip>
    );
}

interface DropzoneProps {
    dropzone: ReturnType<typeof useDropzone>;
    children: ReactNode;
};

const DocumentDropzone = ({ dropzone, children }: DropzoneProps) => {
    const { t } = useTranslation();

    return (
        <div {...dropzone.getRootProps()} className="relative">
            <input {...dropzone.getInputProps()} />
            {children}
            {dropzone.isDragAccept && (
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-(--success-subtle) text-sm font-medium">
                    <FileIcon size={18} /> {t("documents.card.dropToReplace")}
                </div>
            )}
        </div>
    )
}
