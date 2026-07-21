import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { z } from "zod";
import { getAuthenticatorName } from "@better-auth/passkey";
import type { Passkey } from "@better-auth/passkey";

import { Button, FieldInput, Input } from "@/components";
import { authClient } from "@/lib/auth-client.ts";
import { useTranslation } from "react-i18next";

const passkeyNameSchema = z.object({
    name: z.string().min(1, "Pflichtfeld"),
});

export default function PasskeyForm() {
    const queryClient = useQueryClient();
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
                toast.error(error.message ?? "Passkey konnte nicht hinzugefügt werden");
                return;
            }

            await queryClient.invalidateQueries({ queryKey: ["passkeys"] });
            toast.success("Passkey hinzugefügt");
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
            toast.error(error.message ?? "Passkey konnte nicht gelöscht werden");
            return;
        }
        await queryClient.invalidateQueries({ queryKey: ["passkeys"] });
        toast.success("Passkey entfernt");
    };

    const handleRename = async (id: string, name: string) => {
        const { error } = await authClient.passkey.updatePasskey({ id, name });
        if (error) {
            toast.error(error.message ?? "Passkey konnte nicht umbenannt werden");
            return;
        }
        await queryClient.invalidateQueries({ queryKey: ["passkeys"] });
        setEditingId(null);
        toast.success("Passkey umbenannt");
    };

    return (
        <div className="grid gap-4 bg-(--page-bg) p-4 rounded-md border border-(--border) overflow-hidden">
            <form onSubmit={handleAddSubmit} className="grid gap-4">
                <div className="flex items-center gap-2">
                    <addForm.Field name="name" children={(field) => (
                        <div className="flex-1 grid gap-2">
                            <FieldInput field={field} size="sm"
                                placeholder="z. B. MacBook Touch ID" />
                        </div>
                    )} />

                    <addForm.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button type="submit" size="xs" icon={<KeyRound size={15} />}
                                disabled={!canSubmit || isSubmitting || adding}
                                loading={isSubmitting || adding}>
                                Hinzufügen
                            </Button>
                        )}
                    />
                </div>
            </form>

            <div className="grid gap-2">
                {isLoading ? (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Loader className="animate-spin" size={15} />
                        Laden…
                    </div>
                ) : passkeys.length === 0 ? (
                    <p className="text-sm text-gray-400">Noch keine Passkeys registriert.</p>
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

    const label = passkey.name || getAuthenticatorName(passkey.aaguid) || "Passkey";

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
                    aria-label="Umbenennen" onClick={onStartEdit} />
                <Button size="xs" variant="secondary" icon={<Trash2 size={13} />} iconOnly
                    aria-label="Entfernen" onClick={handleDelete} loading={deleting} />
            </div>
        </li>
    );
}
