import {    findDocumentArtifact, hasOutdatedRemote } from "@keepit/schemas";
import { Dot, Download, EllipsisVertical, ExternalLink, File as FileIcon, Info, LoaderCircle, Pencil, RefreshCw, Replace, Trash2, UploadCloud, X } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { tv } from "tailwind-variants";
import { toast } from "react-toastify";
import { useRef, useState } from "react";
import '@docx-editor.dev/core/styles/editor.css';
import { useQuery } from "@tanstack/react-query";
import { Menu } from "@base-ui/react";
import DocumentDocxEditor from "./docx-editor";
import type {DocxEditorRef} from "@docx-editor.dev/react";
import type {DocumentType, OfferDocument, OrderDocument} from "@keepit/schemas";
import { Badge, Button, DocumentRenameModal, Tooltip, buttonStyles, menuStyles } from "@/components";
import {
    documentDownloadUrl, useDocumentCapabilities,
    useDocumentMutations,
    useDocumentTask,
    useLocale,
    useModal
} from "@/hooks";
import { api } from "@/lib/api-client";
import { getDocumentStatus } from "@/utils/status";
import { formatDate } from "@/lib/format";
import { formatBytesToKB } from "@/lib/utils";

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
    /** Woran das Dokument hängt — steuert Endpunkte und Cache-Keys. */
    type: DocumentType;
    /** Id des Angebots bzw. der Bestellung. */
    parentId: string;
    document: OfferDocument | OrderDocument;
}

export default function DocumentCard({ type, parentId, document }: Props) {
    const locales = useLocale();

    const pdf = findDocumentArtifact(document.artifacts, "PDF");
    const docx = findDocumentArtifact(document.artifacts, "DOCX");

    const mutations = useDocumentMutations(type, parentId);

    const { canReplaceFiles, replaceBlocker } = useDocumentCapabilities();

    const hasArtifact = document.status === "GENERATED" || document.status === "UPLOADED";
    const canReplace = hasArtifact && canReplaceFiles && !mutations.isReplacingDocumentFile;

    const dropzone = useDropzone({
        noClick: true,
        noKeyboard: true,
        multiple: false,
        disabled: !canReplace,
        accept: {
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document": []
        },
        // Erst nach dem Hochladen melden, nicht schon beim Annehmen der Datei:
        // Bricht der Upload ab — etwa an einer fehlenden CORS-Regel des Buckets —
        // stand hier vorher trotzdem "erfolgreich ersetzt".
        onDrop: async (acceptedFiles) => {
            const [file] = acceptedFiles;
            if (file === undefined) return;

            try {
                await mutations.replaceDocumentFile({
                    documentId: document.id,
                    format: "docx",
                    file,
                });
                toast.success("Datei wurde ersetzt.");
            } catch (error) {
                toast.error(error instanceof Error ? error.message : "Datei konnte nicht ersetzt werden.");
            }
        },
        onDropRejected(fileRejections, _) {
            toast.error(`File rejected! ${fileRejections.map(r => r.errors.map(e => e.message).join(" & "))}`)
        },
        onError(err) {
            toast.error(`File rejected! ${err.message}`)
        },
    });
    const styles = cardStyles({ focused: dropzone.isFocused });
    const renameModal = useModal();

    const remoteOutdated = hasOutdatedRemote(document.artifacts);
    const task = useDocumentTask(document.taskId);

    const editorRef = useRef<DocxEditorRef>(null);
    const [bytes, setBytes] = useState<Uint8Array>();
    const [editDocx, setEditDocx] = useState<boolean>(false);

    const renderDocumentTooltip = () => {
        return (
            <div className="grid">
                <p>docx: <b>{formatBytesToKB(docx?.size || 0)}</b></p>
                <p>pdf: <b>{formatBytesToKB(pdf?.size || 0)}</b></p>
                <p>version: <b>{document.sourceVersion}</b></p>
            </div>
        )
    }

    const { refetch } = useQuery({
        queryKey: ['fetched', type, document.id],
        enabled: false,
        queryFn: async () => {
            const { url } = await api<{ url: string }>(
                `/api/documents/${type}/${document.id}/artifacts/docx/url`
            );
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Download failed (${res.status})`);
            return new Uint8Array(await res.arrayBuffer());
        }
    });

    return (
        <>
            <div {...dropzone.getRootProps()} className={styles.base({ focused: dropzone.isDragAccept })}>
                {/* Dropzone */}
                <input {...dropzone.getInputProps()} />
                {dropzone.isDragAccept && (
                    <div className={styles.dropzone()}>
                        <div className="flex-row h-full flex items-center justify-center gap-4">
                            <FileIcon className="" size={22} />
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
                            <div className="flex items-center gap-2">
                                {document.isCurrent && (
                                    <Tooltip side="top" content="This is the latest generated document.">
                                        <div className="w-1.5 h-1.5 rounded-full bg-(--primary-600)" />
                                    </Tooltip>
                                )}

                                <p className="text-md font-medium">{document.displayName}</p>
                            </div>
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
                                    <Tooltip content={getDocumentStatus(document.status, locales, "description")}>
                                        <Badge variant={document.status}>{getDocumentStatus(document.status, locales, "value")}</Badge>
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
                                    icon={<UploadCloud size={14} strokeWidth={2} />}
                                    iconOnly
                                    onClick={() => mutations.uploadDocument(document.id)}
                                    loading={mutations.isUploadingDocument}
                                    disabled={document.status === "UPLOADING"}
                                />
                            )}

                            {/* Download Button */}
                            {(document.status === "GENERATED" || document.status === "UPLOADED") && (
                                <Menu.Root>
                                    <Menu.Trigger className={menuStyles().Trigger()}>
                                        <Button size="xs" variant="ghost" icon={<Download size={14} />} iconOnly />
                                    </Menu.Trigger>
                                    <Menu.Portal>
                                        <Menu.Positioner className={menuStyles().Positioner()} align="end">
                                            <Menu.Popup className={menuStyles().Popup()}>
                                                <Menu.Item className={menuStyles().Item()} onClick={() => window.location.assign(documentDownloadUrl(type, document.id, "pdf"))}>
                                                    <Download size={14} /> Download PDF
                                                </Menu.Item>
                                                <Menu.Item className={menuStyles().Item()} onClick={() => window.location.assign(documentDownloadUrl(type, document.id, "docx"))}>
                                                    <Download size={14} /> Download DOCX
                                                </Menu.Item>
                                            </Menu.Popup>
                                        </Menu.Positioner>
                                    </Menu.Portal>
                                </Menu.Root>
                            )}

                            {/* Menu Button */}
                            {(document.status !== "UPLOADING" && document.status !== "PROCESSING") && (
                                <Menu.Root>
                                    <Menu.Trigger className={menuStyles().Trigger()}>
                                        <Button size="xs" variant="ghost" icon={<EllipsisVertical size={14} />} iconOnly />
                                    </Menu.Trigger>
                                    <Menu.Portal>
                                        <Menu.Positioner className={menuStyles().Positioner()} align="end">
                                            <Menu.Popup className={menuStyles().Popup()}>
                                                <Menu.Item className={menuStyles().Item()} disabled>
                                                    <ExternalLink size={14} /> View in NextCloud
                                                </Menu.Item>
                                                <Menu.Item className={menuStyles().Item()} onClick={() => dropzone.open()}>
                                                    <Replace size={14} /> Replace File
                                                </Menu.Item>
                                                <Menu.Item className={menuStyles().Item()} onClick={async () => {
                                                    const result = await refetch();
                                                    if (result.data) setBytes(result.data);
                                                    setEditDocx(true)
                                                }}>
                                                    <Pencil size={14} /> Edit
                                                </Menu.Item>
                                                <Menu.Item className={menuStyles().Item()} onClick={() => renameModal.open()}>
                                                    <Pencil size={14} /> Rename File
                                                </Menu.Item>
                                                <Menu.Item className={menuStyles().Item()} onClick={() => mutations.deleteDocument(document.id)} data-danger>
                                                    <Trash2 size={14} /> Delete
                                                </Menu.Item>
                                            </Menu.Popup>
                                        </Menu.Positioner>
                                    </Menu.Portal>
                                </Menu.Root>
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

            {editDocx && (
                <div className="fixed inset-0 z-[1000]">
                    <DocumentDocxEditor
                        document={bytes}
                        displayName={document.displayName ?? document.id + ".docx"}
                        onSave={async (file) => {
                            try {
                                await mutations.replaceDocumentFile({
                                    documentId: document.id,
                                    format: "docx",
                                    file,
                                });
                                toast.success("Datei wurde gespeichert.");
                                setEditDocx(false);
                            } catch (error) {
                                toast.error(error instanceof Error ? error.message : "Datei konnte nicht gespeichert werden.");
                            }
                        }}
                        onClose={() => {
                            setBytes(undefined);
                            setEditDocx(false)
                        }}
                    />
                </div>
            )}
        </>
    )
}