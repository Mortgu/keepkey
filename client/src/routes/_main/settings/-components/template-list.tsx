import {useEffect, useRef, useState} from "react";
import {toast} from "react-toastify";
import {Download, Plus, RotateCcw, Trash} from "lucide-react";

import type {CloudFile} from "@/types/cloud.ts";
import {formatBytesToKB} from "@/lib/utils.ts";
import {Button, ModalDialog} from "@/components";
import {useDeleteTemplate, useGetTemplates, useNextcloudStatus, useUploadTemplate} from "@/hooks/nextcloud-hook.ts";
import {templateDownloadUrl} from "@/data/nextcloud";
import SettingsCard from "@/routes/_main/settings/-components/settings-card.tsx";

export default function TemplateList() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [templateToDelete, setTemplateToDelete] = useState<CloudFile | null>(null);

    const {connected, isPending: isStatusPending} = useNextcloudStatus();
    const {data: templates, isFetching, refetch, error} = useGetTemplates({enabled: connected});
    const {uploadTemplate, isUploadingTemplate} = useUploadTemplate();
    const {deleteTemplate, isDeletingTemplate} = useDeleteTemplate();

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
            await uploadTemplate({file});
            toast.success("Vorlage hochgeladen");
        } catch (exception: any) {
            toast.error(exception.message);
        }
    };

    const handleDelete = async () => {
        if (!templateToDelete) return;

        try {
            await deleteTemplate({basename: templateToDelete.basename});
            toast.success("Vorlage gelöscht");
        } catch (exception: any) {
            toast.error(exception.message);
        } finally {
            setTemplateToDelete(null);
        }
    };

    return (
        <SettingsCard
            title="Vorlagen verwalten"
            actions={
                <>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx"
                        className="hidden"
                        onChange={handleFileChange}
                    />
                    <Button size="sm" variant="secondary" icon={<Plus className="size-4"/>}
                            disabled={!connected}
                            loading={isUploadingTemplate}
                            onClick={() => fileInputRef.current?.click()}>
                        Hochladen
                    </Button>
                    <Button size="sm" variant="secondary" iconOnly title="Aktualisieren"
                            icon={<RotateCcw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`}/>}
                            disabled={!connected}
                            onClick={() => refetch()}/>
                </>
            }
        >
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
                             className="flex items-center justify-between border border-(--border) py-3 px-4 rounded-md bg-white">
                            <div>
                                <p>{template.basename}</p>
                                <p className="text-sm text-(--text-secondary)">
                                    {template.filename} | {formatBytesToKB(template.size)}
                                </p>
                            </div>

                            <div className="flex items-center">
                                <a href={templateDownloadUrl(template.basename)} download>
                                    <Button variant="ghost" size="sm" icon={<Download className="size-4"/>} iconOnly
                                            title="Herunterladen"/>
                                </a>
                                <Button variant="ghost" size="sm" icon={<Trash className="size-4"/>} iconOnly
                                        title="Löschen"
                                        onClick={() => setTemplateToDelete(template)}/>
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
                        <Button onClick={() => setTemplateToDelete(null)} variant="secondary" size="sm">
                            Abbrechen
                        </Button>
                        <Button size="sm" danger loading={isDeletingTemplate} onClick={handleDelete}>
                            Löschen
                        </Button>
                    </ModalDialog.Footer>
                </ModalDialog>
            )}
        </SettingsCard>
    )
}
