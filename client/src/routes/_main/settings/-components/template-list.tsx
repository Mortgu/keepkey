import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Download, Plus, RotateCcw, Trash } from "lucide-react";

import type { CloudFile } from "@/types/cloud.ts";
import { Badge, Button, ModalDialog } from "@/components";
import { useDeleteTemplate, useGetTemplates, useNextcloudStatus, useUploadTemplate } from "@/hooks/nextcloud-hook.ts";
import { templateDownloadUrl } from "@/data/nextcloud";
import { formatBytesToKB } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export default function TemplateList() {
    const { t } = useTranslation();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [templateToDelete, setTemplateToDelete] = useState<CloudFile | null>(null);

    const { connected, isPending: isStatusPending } = useNextcloudStatus();
    const { data: templates, isFetching, refetch, error } = useGetTemplates({ enabled: connected });
    const { uploadTemplate, isUploadingTemplate } = useUploadTemplate();
    const { deleteTemplate, isDeletingTemplate } = useDeleteTemplate();

    useEffect(() => {
        if (error) {
            toast.error(error.message);
        }
    }, [error]);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        event.target.value = "";

        if (!file) return;

        if (!file.name.toLowerCase().endsWith(".docx")) {
            toast.error("Nur .docx-Dateien sind erlaubt!");
            return;
        }

        try {
            await uploadTemplate({ file });
            toast.success("Vorlage hochgeladen");
        } catch (exception: any) {
            toast.error(exception.message);
        }
    };

    const handleDelete = async () => {
        if (!templateToDelete) return;

        try {
            await deleteTemplate({ basename: templateToDelete.basename });
            toast.success("Vorlage gelöscht");
        } catch (exception: any) {
            toast.error(exception.message);
        } finally {
            setTemplateToDelete(null);
        }
    };

    return (
        <div className="grid gap-4 overflow-hidden">
            <div className="flex items-center justify-end gap-2">
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".docx"
                    className="hidden"
                    onChange={handleFileChange}
                />
                <Button size="xs" variant="primary" icon={<Plus className="size-4" />}
                    disabled={!connected}
                    loading={isUploadingTemplate}
                    onClick={() => fileInputRef.current?.click()}>
                    Hochladen
                </Button>
                <Button size="xs" variant="secondary" iconOnly title="Aktualisieren"
                    icon={<RotateCcw className={`size-3 ${isFetching ? "animate-spin" : ""}`} />}
                    disabled={!connected}
                    onClick={() => refetch()} />
            </div>

            {!connected && !isStatusPending && (
                <p className="text-sm text-(--text-secondary)">Nextcloud ist nicht konfiguriert.</p>
            )}

            {connected && templates?.length === 0 && (
                <p className="text-sm text-(--text-secondary)">Keine Vorlagen vorhanden.</p>
            )}

            {connected && !!templates?.length && (
                <div className="grid gap-2">
                    {templates.map(template => (
                        <div key={template.filename}
                            className="flex items-center justify-between bg-(--page-bg) border border-(--border) py-3 px-4 rounded-md">
                            <div className="grid gap-0">
                                <div className="flex items-center gap-2">
                                    <p>{template.basename}</p>
                                    <Badge variant="generated">{formatBytesToKB(template.size)}</Badge>
                                </div>
                                <p className="text-sm text-(--text-secondary) font-light">{template.filename}</p>
                            </div>

                            <div className="flex items-center gap-2">
                                <a href={templateDownloadUrl(template.basename)} download>
                                    <Button variant="secondary" size="xs" icon={<Download className="size-3.5" />} iconOnly
                                        title="Herunterladen" />
                                </a>
                                <Button variant="secondary" size="xs" icon={<Trash className="size-3.5" />} iconOnly
                                    title="Löschen" onClick={() => setTemplateToDelete(template)} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {templateToDelete && (
                <ModalDialog onClose={() => setTemplateToDelete(null)}>
                    <ModalDialog.Header>
                        <h1 className="text-lg">Vorlage löschen</h1>
                    </ModalDialog.Header>
                    <ModalDialog.Content>
                        <p>Möchten Sie die Vorlage „{templateToDelete.basename}" wirklich löschen?</p>
                    </ModalDialog.Content>
                    <ModalDialog.Footer>
                        <Button onClick={() => setTemplateToDelete(null)} variant="border" size="sm">
                            {t("button.cancel")}
                        </Button>
                        <Button size="sm" danger loading={isDeletingTemplate} onClick={handleDelete}>
                            {t("button.delete")}
                        </Button>
                    </ModalDialog.Footer>
                </ModalDialog>
            )}


        </div>
    )
}
