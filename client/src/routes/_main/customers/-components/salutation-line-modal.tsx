import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import type { Contact } from "@keepit/schemas";
import { Button, Dialog, Textarea } from "@/components";

interface SalutationLineModalProps {
    onClose: () => void;
    contactPerson: Contact;
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

    const fullName = `${contactPerson.salutation ? contactPerson.salutation + " " : ""}${contactPerson.firstName} ${contactPerson.lastName}`;

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {

        e.preventDefault();

        e.stopPropagation();

        form.handleSubmit();

    };


    return (
        <Dialog
            defaultOpen
            onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
        >
            <Dialog.Header title="Anredezeile" description={fullName} />
            <Dialog.Body>
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
            </Dialog.Body>
            <Dialog.Footer>
                <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            form="salutation-line-form"
                            size="sm"
                            disabled={!canSubmit}
                            loading={isSubmitting}
                        >
                            {t("button.save")}
                        </Button>
                    )}
                />
            </Dialog.Footer>
        </Dialog>
    );
}
