import { ActionMenu, Button, buttonStyles, DocumentRenameModal, Tooltip } from "@/components";
import { documentDownloadUrl, useDocumentMutations, useDocumentTask, useLocale, useModal } from "@/hooks";
import { formatBytesToKB } from "@/lib/utils";
import { findDocumentArtifact, hasOutdatedRemote, type OfferDocument } from "@keepit/schemas";
import { Dot, File, Download, ExternalLink, Info, Pencil, RefreshCw, Trash2, UploadCloud, X, LoaderCircle, Replace } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { tv } from "tailwind-variants";
import { Badge } from '@/components';
import { formatDate } from "@/lib/format";
import { getDocumentStatus } from "@/utils/status";

const cardStyles = tv({
    slots: {
        base: 'relative py-3',
        card: 'flex items-center justify-between',
        dropzone: 'absolute top-0 left-0 bg-white w-full h-full z-1 transition duration-150 ease-in-out',
    },
    variants: {
        focused: {
            true: 'scale-95',
            false: ''
        }
    },
    compoundVariants: [
        {
            focused: true,
            slots: ['dropzone'],
            className: 'scale-95'
        }
    ]
})

interface Props {
    offerId: string;
    document: OfferDocument;
}

export default function DocumentCard({ offerId, document }: Props) {
    const locales = useLocale();

    const pdf = findDocumentArtifact(document.artifacts, "PDF");
    const docx = findDocumentArtifact(document.artifacts, "DOCX");

    const mutations = useDocumentMutations("offer", offerId);
    const dropzone = useDropzone({
        noClick: true,
        noKeyboard: true,
        multiple: false,
        accept: {
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": []
        },
        onDrop: (acceptedFiles) => {
            const [file] = acceptedFiles;
            if (acceptedFiles.length === 0) return;

            mutations.replaceDocumentFile({
                documentId: document.id,
                format: "docx",
                file
            });
        }
    });
    const styles = cardStyles({ focused: dropzone.isFocused });
    const renameModal = useModal();

    const remoteOutdated = hasOutdatedRemote(document.artifacts);
    const task = useDocumentTask(document.taskId);

    const renderDocumentTooltip = () => {
        return (
            <div className="grid">
                <p>docx: <b>{formatBytesToKB(docx?.size || 0)}</b></p>
                <p>pdf: <b>{formatBytesToKB(pdf?.size || 0)}</b></p>
                <p>version: <b>{document.sourceVersion}</b></p>
            </div>
        )
    }

    return (
        <div {...dropzone.getRootProps()} className={styles.base({ focused: dropzone.isDragAccept })}>
            {/* Dropzone */}
            <input {...dropzone.getInputProps()} />
            {dropzone.isDragAccept && (
                <div className={styles.dropzone()}>
                    <div className="flex-row h-full flex items-center justify-center gap-4">
                        <File className="" size={22} />
                        <div className="grid gap-1">
                            <p className="uppercase text-sm font-medium">Drop the file to replace this one!</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Card */}
            <div className={styles.card()}>

                {/* Card - Left */}
                <div className="grid gap-1">
                    {/* Document display name + info tooltip */}
                    <div className="flex items-center gap-4">
                        <p className="text-md font-medium">{document.displayName}</p>
                        <Tooltip content={<>{renderDocumentTooltip()}</>} side="right">
                            <Info size={18} className="text-gray-400 hover:text-black" />
                        </Tooltip>
                    </div>
                    {/* createdAt + document status */}
                    <div className="flex items-center gap-1 text-sm">
                        <p className="text-gray-400 font-normal">{formatDate(document.createdAt)}</p>
                        {/* Displays normal status badge */}
                        {!remoteOutdated && (
                            <>
                                <Dot size={14} className="text-gray-200" />
                                <Tooltip content='The document is generated but not on NextCloud!'>
                                    <Badge variant={document.status}>{getDocumentStatus(document.status, locales)}</Badge>
                                </Tooltip>
                            </>
                        )}
                        {/* Displays "out of sync" badge */}
                        {remoteOutdated && (
                            <>
                                <Dot size={14} className="text-gray-200" />
                                <Tooltip content='The NextCloud version differs from the local one!'>
                                    <Badge variant="FAILED">Out of Sync</Badge>
                                </Tooltip>
                            </>
                        )}
                    </div>
                </div>

                {/* Card - right */}
                <div className="flex items-center">
                    {/* "Out of sync" actions */}
                    {remoteOutdated && (
                        <div className="flex items-center border-r border-(--border) pr-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<RefreshCw size={16} strokeWidth={2} />}
                                iconOnly
                                onClick={() => mutations.resyncDocument(document.id)}
                                loading={mutations.isResyncingDocument}
                                disabled={mutations.isResyncingDocument}
                            />

                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<X size={18} strokeWidth={2.2} />}
                                iconOnly
                                disabled
                            />
                        </div>
                    )}

                    {/* "normal" actions */}
                    <div className="flex items-center pl-4">
                        {/* Upload Button */}
                        {(document.status === "GENERATED" || document.status === "UPLOADING") && (
                            <Button
                                variant="ghost"
                                size="sm"
                                icon={<UploadCloud size={16} strokeWidth={2} />}
                                iconOnly
                                onClick={() => mutations.uploadDocument(document.id)}
                                loading={mutations.isUploadingDocument}
                                disabled={document.status === "UPLOADING"}
                            />
                        )}

                        {/* Download Button */}
                        {(document.status === "GENERATED" || document.status === "UPLOADED") && (
                            <ActionMenu
                                label="Downloads"
                                icon={<Download size={16} strokeWidth={2} />}
                                items={[
                                    {
                                        label: "Download PDF",
                                        icon: <Download size={14} />,
                                        href: documentDownloadUrl("offer", document.id, "pdf"),
                                        download: '',
                                        condition: document.status === "GENERATED" || document.status === "UPLOADED" || document.status === "UPLOADING"
                                    },
                                    {
                                        label: "Download DOCX",
                                        icon: <Download size={14} />,
                                        href: documentDownloadUrl("offer", document.id, "docx"),
                                        download: '',
                                        condition: document.status === "GENERATED" || document.status === "UPLOADED" || document.status === "UPLOADING"
                                    }
                                ]}
                            />
                        )}

                        {/* Menu Button */}
                        {(document.status !== "UPLOADING" && document.status !== "PROCESSING") && (
                            <ActionMenu
                                label="Actions"
                                items={[
                                    {
                                        label: "View in NextCloud",
                                        icon: <ExternalLink className="size-3.5" />,
                                        onSelect: () => { },
                                        condition: document.status === "FAILED",
                                    },
                                    {
                                        label: "Replace file",
                                        icon: <Replace className="size-3.5" />,
                                        onSelect: () => dropzone.open(),
                                    },
                                    {
                                        label: "Edit",
                                        icon: <Pencil className="size-3.5" />,
                                        onSelect: () => renameModal.open(),
                                        condition: document.status === "GENERATED" || document.status === "UPLOADED"
                                    },
                                    {
                                        label: "Delete",
                                        icon: <Trash2 className="size-3.5" />,
                                        danger: true,
                                        disabled: mutations.isDeletingDocument,
                                        onSelect: () => mutations.deleteDocument(document.id),
                                        condition: document.status === "GENERATED" || document.status === "UPLOADED" || document.status === "FAILED"
                                    },
                                ]}
                            />
                        )}

                        {/* Loader Circle */}
                        {(document.status === "PROCESSING") && (
                            <div className={buttonStyles({ variant: "ghost", size: "sm" })}>
                                <LoaderCircle size={16} strokeWidth={2} className="animate-spin" />
                            </div>
                        )}
                    </div>

                </div>
            </div>

            {renameModal.isOpen && (
                <DocumentRenameModal
                    key={renameModal.key}
                    onClose={renameModal.close}
                    isPending={mutations.isRenamingDocument}
                    initialValue={document.displayName ?? `v${document.version}`}
                    onSubmit={(displayName) => mutations.renameDocument({
                        documentId: document.id,
                        displayName: displayName,
                    })}
                />
            )}
        </div>
    )
}