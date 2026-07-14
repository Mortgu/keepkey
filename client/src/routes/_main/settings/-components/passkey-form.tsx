import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Loader, Pencil, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { z } from "zod";
import { getAuthenticatorName } from "@better-auth/passkey";
import type { Passkey } from "@better-auth/passkey";

import { Button, Input } from "@/components";
import { authClient } from "@/lib/auth-client.ts";
import { getFormError } from "@/lib/utils.ts";
import SettingsCard from "@/routes/_main/settings/-components/settings-card.tsx";

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
        <SettingsCard title="Passkeys">
            <form onSubmit={handleAddSubmit} className="grid gap-4">
                <p className="text-sm text-gray-500">
                    Registriere einen Passkey (TouchID, Gesichtserkennung, Sicherheitsschlüssel),
                    um dich künftig ohne Passwort anzumelden.
                </p>

                <div className="flex items-end gap-2">
                    <addForm.Field name="name" children={(field) => (
                        <div className="flex-1 grid gap-2">
                            <Input id={field.name} label="Bezeichnung" size="sm"
                                placeholder="z. B. MacBook Touch ID"
                                error={getFormError(field.state.meta.errors)}
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        </div>
                    )} />

                    <addForm.Subscribe
                        selector={(state) => [state.canSubmit, state.isSubmitting]}
                        children={([canSubmit, isSubmitting]) => (
                            <Button type="submit" size="sm" icon={<KeyRound size={15} />}
                                disabled={!canSubmit || isSubmitting || adding}
                                loading={isSubmitting || adding}>
                                Hinzufügen
                            </Button>
                        )}
                    />
                </div>
            </form>

            <div className="grid gap-2">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-medium text-gray-700">Registrierte Passkeys</h2>
                </div>

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
        </SettingsCard>
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
                <Button size="sm" onClick={handleSave} loading={saving} disabled={!name.trim()}>
                    Speichern
                </Button>
                <Button size="sm" variant="ghost" onClick={onCancelEdit} disabled={saving}>
                    Abbrechen
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
            <div className="flex items-center gap-1">
                <Button size="xs" variant="secondary" icon={<Pencil size={14} />} iconOnly
                    aria-label="Umbenennen" onClick={onStartEdit} />
                <Button size="xs" variant="secondary" icon={<Trash2 size={14} />} iconOnly
                    aria-label="Entfernen" onClick={handleDelete} loading={deleting} />
            </div>
        </li>
    );
}
