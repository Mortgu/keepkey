import { Button, Input, ModalDialog } from "@/components";
import { useSettingsHook } from "@/hooks/settings-hook";
import { useForm } from "@tanstack/react-form";
import type { SyntheticEvent } from "react";
import { z } from 'zod';

type Props = {
    onClose: () => void;
};

const formSchema = z.object({
    pdfPath: z.string().min(1),
    docxPath: z.string().min(1),
})

export default function OfferNextCloudSettingsModal({ onClose }: Props) {
    const { updateSetting } = useSettingsHook();

    const settingsForm = useForm({
        defaultValues: {
            pdfPath: '',
            docxPath: '',
        },
        validators: {
            onChange: formSchema,
            onMount: formSchema,
        },
        onSubmit: async ({ value }) => {
            Object.entries(value).map(async (entry) => {
                let key = `nextcloud.offers.${entry[0]}`;
                let value = entry[1];

                await updateSetting({ key, value })
            })
        }
    });

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        settingsForm.handleSubmit();
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>NextCloud – Einstellungen</ModalDialog.Header>
            <ModalDialog.Content>
                <form id="offer-nextcloud-settings" onSubmit={handleSubmit} className="grid gap-4">
                    <settingsForm.Field name="pdfPath">
                        {(field) => (
                            <Input label="PDF-Pfad" placeholder="/Keepit/Angebote/PDF"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        )}
                    </settingsForm.Field>

                    <settingsForm.Field name="docxPath">
                        {(field) => (
                            <Input label="DOCX-Pfad" placeholder="/Keepit/Angebote/DOCX"
                                value={field.state.value}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        )}
                    </settingsForm.Field>
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button variant="secondary" size="sm" type="button" onClick={onClose}>
                    Abbrechen
                </Button>
                <settingsForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button form="offer-nextcloud-settings" size="sm" type="submit" disabled={!canSubmit}
                        loading={isSubmitting}>
                        Speichern
                    </Button>
                )} />
            </ModalDialog.Footer>
        </ModalDialog>
    )
}
