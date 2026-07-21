import { useForm } from "@tanstack/react-form";
import type { ContactPerson } from "@/types";
import { Button, ModalDialog, Textarea } from "@/components";
import { useTranslation } from "react-i18next";

interface SalutationLineModalProps {
    onClose: () => void;
    contactPerson: ContactPerson;
}

export default function SalutationLineModal({ onClose, contactPerson }: SalutationLineModalProps) {
    const { t } = useTranslation();

    const form = useForm({
        defaultValues: {
            salutationLine: "",
        },
        onSubmit: () => {
            onClose();
        },
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    };

    const fullName = `${contactPerson.salutation ? contactPerson.salutation + " " : ""}${contactPerson.firstName} ${contactPerson.lastName}`;

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <div className="grid gap-0.5">
                    <h1 className="text-lg">Anredezeile</h1>
                    <p className="text-sm text-(--text-secondary)">{fullName}</p>
                </div>
            </ModalDialog.Header>

            <ModalDialog.Content>
                <form id="salutation-line-form" onSubmit={handleSubmit} className="grid gap-4">
                    <form.Field name="salutationLine" children={(field) => (
                        <Textarea
                            id={field.name}
                            size="sm"
                            rows={5}
                            label="Anredezeile"
                            placeholder="z.B. Sehr geehrte Frau Müller, ..."
                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                        />
                    )} />
                </form>
            </ModalDialog.Content>

            <ModalDialog.Footer>
                <Button onClick={onClose} type="button" size="sm" variant="border">
                    {t("button.cancel")}
                </Button>
                <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button type="submit" form="salutation-line-form" size="sm" disabled={!canSubmit} loading={isSubmitting}>
                        {t("button.save")}
                    </Button>
                )} />
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
