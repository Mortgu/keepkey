import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Pencil, Trash2 } from "lucide-react";
import { z } from "zod";
import { getAuthenticatorName } from "@better-auth/passkey";
import { useTranslation } from "react-i18next";
import type { Passkey } from "@better-auth/passkey";

import { Button, FieldInput, Input, ListSkeleton, Skeleton, showToast } from "@/components";
import { authClient } from "@/lib/auth-client.ts";

export default function PasskeyForm() {
    const { t } = useTranslation();
    const queryClient = useQueryClient();

    const passkeyNameSchema = z.object({
        name: z.string().min(1, t("validation.required")),
    });
    const [adding, setAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const { data: passkeys = [], isLoading } = useQuery({
        queryKey: ["passkeys"],
        queryFn: async () => {
            const { data, error } = await authClient.passkey.listUserPasskeys();
            if (error) {
                throw error;
            }
            return data;
        },
    });

    const addForm = useForm({
        defaultValues: { name: "" },
        validators: { onChange: passkeyNameSchema },
        onSubmit: async ({ value, formApi }) => {
            setAdding(true);
            const { error } = await authClient.passkey.addPasskey({
                name: value.name,
            });

            setAdding(false);

            if (error) {
                showToast.error("settings.toast.passkeyAddFailed", { message: error.message });
                return;
            }

            await queryClient.invalidateQueries({ queryKey: ["passkeys"] });
            showToast.success("settings.toast.passkeyAdded");
            formApi.reset();
        },
    });

    const handleAddSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        addForm.handleSubmit();
    };

    const handleDelete = async (id: string) => {
        const { error } = await authClient.passkey.deletePasskey({ id });
        if (error) {
            showToast.error("settings.toast.passkeyDeleteFailed", { message: error.message });
            return;
        }
        await queryClient.invalidateQueries({ queryKey: ["passkeys"] });
        showToast.success("settings.toast.passkeyRemoved");
    };

    const handleRename = async (id: string, name: string) => {
        const { error } = await authClient.passkey.updatePasskey({ id, name });
        if (error) {
            showToast.error("settings.toast.passkeyRenameFailed", { message: error.message });
            return;
        }
        await queryClient.invalidateQueries({ queryKey: ["passkeys"] });
        setEditingId(null);
        showToast.success("settings.toast.passkeyRenamed");
    };

    return (
        <div className="grid gap-4 bg-(--page-bg) p-4 rounded-md border border-(--border) overflow-hidden">
            <form onSubmit={handleAddSubmit} className="grid gap-4">
                <div className="flex items-center gap-2">
                    <addForm.Field name="name" children={(field) => (
                        <div className="flex-1 grid gap-2">
                            <FieldInput field={field} size="sm"
                                placeholder={t("settings.passkey.placeholder")} />
                        </div>
                    )} />

                    <addForm.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button type="submit" size="xs" icon={<KeyRound size={15} />}
                                disabled={!canSubmit || isSubmitting || adding}
                                loading={isSubmitting || adding}>
                                {t("settings.passkey.add")}
                            </Button>
                        )}
                    />
                </div>
            </form>

            <div className="grid gap-2">
                {isLoading ? (
                    <ListSkeleton rows={2} skeleton={<Skeleton shape="rect" className="h-10" />} />
                ) : passkeys.length === 0 ? (
                    <p className="text-sm text-(--text-secondary)">{t("settings.passkey.empty")}</p>
                ) : (
                    <ul className="grid gap-2">
                        {passkeys.map((passkey: Passkey) => (
                            <PasskeyRow
                                key={passkey.id}
                                passkey={passkey}
                                editing={editingId === passkey.id}
                                onStartEdit={() => setEditingId(passkey.id)}
                                onCancelEdit={() => setEditingId(null)}
                                onRename={(name) => handleRename(passkey.id, name)}
                                onDelete={() => handleDelete(passkey.id)}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

type PasskeyRowProps = {
    passkey: Passkey;
    editing: boolean;
    onStartEdit: () => void;
    onCancelEdit: () => void;
    onRename: (name: string) => void;
    onDelete: () => void;
};

function PasskeyRow({ passkey, editing, onStartEdit, onCancelEdit, onRename, onDelete }: PasskeyRowProps) {
    const { t } = useTranslation();
    const [name, setName] = useState(passkey.name ?? "");
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const label = passkey.name || getAuthenticatorName(passkey.aaguid) || t("settings.passkey.fallbackName");

    const handleSave = async () => {
        if (!name.trim()) return;
        setSaving(true);
        await onRename(name.trim());
        setSaving(false);
    };

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete();
        setDeleting(false);
    };

    if (editing) {
        return (
            <li className="flex items-center gap-2 border border-(--border) rounded-md px-3 py-2">
                <Input size="sm" value={name} onChange={(e) => setName(e.target.value)}
                    className="flex-1"
                    autoFocus
                    onKeyDown={(e) => {
                        if (e.key === "Enter") { e.preventDefault(); handleSave(); }
                        if (e.key === "Escape") { onCancelEdit(); }
                    }}
                />
                <Button size="xs" onClick={handleSave} loading={saving} disabled={!name.trim()}>
                    {t("button.save")}
                </Button>
                <Button size="xs" variant="border" onClick={onCancelEdit} disabled={saving}>
                    {t("button.cancel")}
                </Button>
            </li>
        );
    }

    return (
        <li className="flex items-center justify-between border border-(--border) rounded-md px-3 py-2">
            <div className="flex items-center gap-2 min-w-0">
                <KeyRound size={15} className="text-gray-400 shrink-0" />
                <span className="text-sm truncate">{label}</span>
            </div>
            <div className="flex items-center gap-2">
                <Button size="xs" variant="secondary" icon={<Pencil size={13} />} iconOnly
                    aria-label={t("settings.passkey.rename")} onClick={onStartEdit} />
                <Button size="xs" variant="secondary" icon={<Trash2 size={13} />} iconOnly
                    aria-label={t("settings.passkey.remove")} onClick={handleDelete} loading={deleting} />
            </div>
        </li>
    );
}
