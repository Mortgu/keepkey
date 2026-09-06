import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Download, Pencil, Plus, Trash, Type } from "lucide-react";
import {
    DOCUMENT_TEMPLATE_KINDS,
    groupTemplatesBySlot,
    type DocumentTemplate,
    type DocumentTemplateKind,
    type DocumentTemplateSlot,
} from "@keepit/schemas";
import SectionCard from "./section-card";
import {
    Button,
    DocumentDocxEditor,
    DocumentRenameModal,
    Dialog,
    ListSkeleton,
    RouteError,
    Skeleton,
    showToast,
} from "@/components";
import {
    getTemplateContent,
    templateDownloadUrl,
    useTemplateMutations,
    useTemplates,
} from "@/hooks";
import { formatBytesToKB } from "@/lib/utils";
import { formatDate } from "@/lib/format";

/** Welcher Slot gerade eine Datei erwartet — der Upload-Dialog kennt keinen eigenen. */
type PendingUpload = { kind: DocumentTemplateKind; language: DocumentTemplateSlot["language"] };

export default function TemplateList() {
    const { t } = useTranslation();

    const { data: templates, isPending, error } = useTemplates();
    const mutations = useTemplateMutations();

    const fileInputRef = useRef<HTMLInputElement>(null);
    const pendingUpload = useRef<PendingUpload | null>(null);

    const [templateToDelete, setTemplateToDelete] = useState<DocumentTemplate | null>(null);
    const [templateToRename, setTemplateToRename] = useState<DocumentTemplate | null>(null);
    const [editing, setEditing] = useState<{ template: DocumentTemplate; bytes: Uint8Array } | null>(null);

    if (error) return <RouteError error={error} />;

    if (isPending) {
        return (
            <div className="grid gap-4">
                <ListSkeleton rows={2} skeleton={<Skeleton className="h-40" />} />
            </div>
        );
    }

    const slots = groupTemplatesBySlot(templates ?? []);

    const openUpload = (kind: DocumentTemplateKind, language: DocumentTemplateSlot["language"]) => {
        pendingUpload.current = { kind, language };
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        const target = pendingUpload.current;

        // Zuruecksetzen, damit dieselbe Datei erneut gewaehlt werden kann.
        event.target.value = "";
        pendingUpload.current = null;

        if (!file || !target) return;

        if (!file.name.toLowerCase().endsWith(".docx")) {
            showToast.error("templates.toast.notDocx");
            return;
        }

        try {
            await mutations.uploadTemplate({ ...target, file });
            showToast.success("templates.toast.uploaded");
        } catch {
            // Der globale onError-Handler zeigt die Server-Meldung bereits an.
        }
    };

    const handleActivate = async (template: DocumentTemplate) => {
        try {
            await mutations.activateTemplate(template.id);
            showToast.success("templates.toast.activated");
        } catch { /* siehe oben */ }
    };

    const handleEdit = async (template: DocumentTemplate) => {
        try {
            setEditing({ template, bytes: await getTemplateContent(template.id) });
        } catch {
            showToast.error("templates.toast.loadFailed");
        }
    };

    const handleDelete = async () => {
        if (!templateToDelete) return;

        try {
            await mutations.deleteTemplate(templateToDelete.id);
            showToast.success("templates.toast.deleted");
        } catch { /* siehe oben */ } finally {
            setTemplateToDelete(null);
        }
    };

    const renderRow = (template: DocumentTemplate) => (
        <div
            key={template.id}
            className="flex items-center justify-between gap-4 bg-white border border-(--border) py-2.5 px-3 rounded-md"
        >
            <div className="grid gap-0.5 min-w-0">
                <div className="flex items-center gap-2">
                    <p className="truncate">{template.name}</p>
                    {template.isActive && (
                        <span className="shrink-0 rounded-full px-2 py-0.5 text-xs font-medium bg-(--primary-100) text-(--primary-600)">
                            {t("templates.active")}
                        </span>
                    )}
                </div>
                <p className="text-sm text-(--text-secondary) font-light truncate">
                    {template.fileName} · {formatBytesToKB(template.size)} · {formatDate(template.updatedAt)}
                </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
                {!template.isActive && (
                    <Button
                        variant="secondary"
                        size="xs"
                        icon={<Check className="size-3.5" />}
                        loading={mutations.isActivatingTemplate}
                        onClick={() => handleActivate(template)}
                    >
                        {t("templates.setActive")}
                    </Button>
                )}
                <Button
                    variant="secondary"
                    size="xs"
                    iconOnly
                    icon={<Pencil className="size-3.5" />}
                    title={t("templates.edit")}
                    onClick={() => handleEdit(template)}
                />
                <Button
                    variant="secondary"
                    size="xs"
                    iconOnly
                    icon={<Type className="size-3.5" />}
                    title={t("templates.rename")}
                    onClick={() => setTemplateToRename(template)}
                />
                <a href={templateDownloadUrl(template.id)} download>
                    <Button
                        variant="secondary"
                        size="xs"
                        iconOnly
                        icon={<Download className="size-3.5" />}
                        title={t("templates.download")}
                    />
                </a>
                <Button
                    variant="secondary"
                    size="xs"
                    iconOnly
                    icon={<Trash className="size-3.5" />}
                    title={t("templates.delete")}
                    onClick={() => setTemplateToDelete(template)}
                />
            </div>
        </div>
    );

    const renderSlot = (slot: DocumentTemplateSlot) => {
        const others = slot.templates.filter((template) => !template.isActive);

        return (
            <div key={`${slot.kind}-${slot.language}`} className="grid gap-2">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="font-medium">
                        {t(`templates.language.${slot.language}`)}
                    </h2>
                    <Button
                        size="xs"
                        variant="primary"
                        icon={<Plus className="size-4" />}
                        loading={mutations.isUploadingTemplate}
                        onClick={() => openUpload(slot.kind, slot.language)}
                    >
                        {t("templates.upload")}
                    </Button>
                </div>

                {slot.active
                    ? renderRow(slot.active)
                    : (
                        <p className="text-sm text-(--text-secondary)">
                            {t("templates.noActive")}
                        </p>
                    )}

                {others.length > 0 && (
                    <div className="grid gap-2 pl-4 border-l-2 border-(--border)">
                        <p className="text-sm text-(--text-secondary)">
                            {t("templates.library")}
                        </p>
                        {others.map(renderRow)}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="grid gap-4 overflow-hidden">
            <input
                ref={fileInputRef}
                type="file"
                accept=".docx"
                className="hidden"
                onChange={handleFileChange}
            />

            {DOCUMENT_TEMPLATE_KINDS.map((kind) => (
                <SectionCard key={kind} title={t(`templates.kind.${kind}`)}>
                    <div className="grid gap-6">
                        {slots.filter((slot) => slot.kind === kind).map(renderSlot)}
                    </div>
                </SectionCard>
            ))}

            {templateToRename && (
                <DocumentRenameModal
                    onClose={() => setTemplateToRename(null)}
                    isPending={mutations.isRenamingTemplate}
                    initialValue={templateToRename.name}
                    onSubmit={async (name) => {
                        await mutations.renameTemplate({ id: templateToRename.id, name });
                        showToast.success("templates.toast.renamed");
                    }}
                />
            )}

            {templateToDelete && (
                <Dialog
                    defaultOpen
                    size="sm"
                    onOpenChange={(open) => { if (!open) setTemplateToDelete(null); }}
                >
                    <Dialog.Header title={t("templates.deleteTitle")} />
                    <Dialog.Body>
                        <p>{t("templates.deleteConfirm", { name: templateToDelete.name })}</p>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
                        <Button size="sm" danger loading={mutations.isDeletingTemplate} onClick={handleDelete}>
                            {t("button.delete")}
                        </Button>
                    </Dialog.Footer>
                </Dialog>
            )}

            {editing && (
                <div className="fixed inset-0 z-[1000]">
                    <DocumentDocxEditor
                        document={editing.bytes}
                        displayName={editing.template.fileName}
                        onSave={async (file) => {
                            try {
                                await mutations.replaceTemplateContent({ id: editing.template.id, file });
                                showToast.success("templates.toast.saved");
                                setEditing(null);
                            } catch { /* Editor offen lassen, damit nichts verloren geht. */ }
                        }}
                        onClose={() => setEditing(null)}
                    />
                </div>
            )}
        </div>
    );
}
