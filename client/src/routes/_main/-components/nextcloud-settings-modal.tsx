import { Input, ModalDialog, Button } from "@/components";
import { useForm } from "@tanstack/react-form";
import { useNextcloudPaths } from "@/hooks/nextcloud-hook";
import { useEffect, type SyntheticEvent } from "react";
import { z } from 'zod';

type Props = {
    open: boolean;
    cancelFn: () => void;
};

const formSchema = z.object({
    pdfPath: z.string().min(1),
    docxPath: z.string().min(1),
})

export default function NextCloudSettingsModal({ open, cancelFn }: Props) {
    const { paths, savePaths, isSaving } = useNextcloudPaths();

    const form = useForm({
        defaultValues: {
            pdfPath: paths?.pdfPath ?? "",
            docxPath: paths?.docxPath ?? "",
        },
        validators: {
            onChange: formSchema,
            onMount: formSchema
        },
        onSubmit: async ({ value }) => {
            await savePaths(value);
            cancelFn();
        },
    });

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    };

    return (
        <ModalDialog cancelFn={cancelFn} open={open}>
            <ModalDialog.Header>NextCloud – Einstellungen</ModalDialog.Header>
            <ModalDialog.Content>
                <form id="nextcloud-form" onSubmit={handleSubmit} className="grid gap-4">
                    <div className="rounded-md bg-[#F0F4F1] px-3 py-2 text-xs text-[#4B5C52]">
                        Verbindungsdaten (Host, Benutzer, Passwort) werden über die <code>.env</code> konfiguriert.
                    </div>

                    <form.Field name="pdfPath">
                        {(field) => (
                            <Input
                                label="PDF-Pfad"
                                placeholder="/Keepit/Angebote/PDF"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        )}
                    </form.Field>

                    <form.Field name="docxPath">
                        {(field) => (
                            <Input
                                label="DOCX-Pfad"
                                placeholder="/Keepit/Angebote/DOCX"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        )}
                    </form.Field>
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button variant="secondary" size="sm" type="button" onClick={cancelFn}>
                    Abbrechen
                </Button>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button form="nextcloud-form" size="sm" type="submit" disabled={!canSubmit}
                        loading={isSubmitting || isSaving}>
                        Speichern
                    </Button>
                )} />
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
