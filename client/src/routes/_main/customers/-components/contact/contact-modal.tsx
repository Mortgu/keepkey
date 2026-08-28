import { z } from "zod";
import { useTranslation } from "react-i18next";
import { useForm } from "@tanstack/react-form";
import { useState } from "react";
import type { Contact } from "@keepit/schemas";
import type { ReactElement } from "react";
import { useCreateCustomerContact, useUpdateCustomerContact } from "@/hooks";
import { Button, Dialog, FieldInput } from "@/components";

const contactPersonSchema = z.object({
    salutation: z.string().min(1, "Anrede fehlt"),
    firstName: z.string().min(1, "Vorname fehlt"),
    lastName: z.string().min(1, "Nachname fehlt"),
    email: z.email().nullable(),
});

interface Props {
    customerId: string;
    contact?: Contact | null;
    /** Element, das den Dialog öffnet. */
    trigger: ReactElement;
}

export default function ContactModal({ customerId, contact, trigger }: Props) {
    const { t } = useTranslation();
    const { createCustomerContact } = useCreateCustomerContact();
    const { updateCustomerContact } = useUpdateCustomerContact();

    const [open, setOpen] = useState(false);

    const contactForm = useForm({
        defaultValues: {
            salutation: contact?.salutation ?? "",
            firstName: contact?.firstName ?? "",
            lastName: contact?.lastName ?? "",
            email: contact?.email ?? null,
        },
        validators: {
            onChange: contactPersonSchema,
            onMount: contactPersonSchema,
        },
        onSubmit: ({ value }) => {
            const input = {
                salutation: value.salutation,
                firstName: value.firstName,
                lastName: value.lastName,
                email: value.email || "",
                customerId,
            };

            if (contact) {
                updateCustomerContact({ id: customerId, contactId: contact.id, input });
            } else {
                createCustomerContact({ id: customerId, input });
            }

            setOpen(false);
        },
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {

        e.preventDefault();

        e.stopPropagation();

        contactForm.handleSubmit();

    };


    return (
        <Dialog
            trigger={trigger}
            open={open}
            size="md"
            onOpenChange={setOpen}
        >
            <Dialog.Header title={contact ? "Kontaktperson bearbeiten" : "Kontaktperson hinzufügen"} />
            <Dialog.Body>
                <form id={`contact-form-${contact?.id ?? "new"}`} onSubmit={handleSubmit} className="grid gap-4">
                    <div className="flex items-center gap-2">
                        <contactForm.Field name="salutation" children={(field) => (
                            <FieldInput field={field} label="Anrede" className="bg-white" />
                        )} />

                        <contactForm.Field name="firstName" children={(field) => (
                            <FieldInput field={field} label="Vorname" className="bg-white" />
                        )} />

                        <contactForm.Field name="lastName" children={(field) => (
                            <FieldInput field={field} label="Nachname" className="bg-white" />
                        )} />
                    </div>

                    <contactForm.Field name="email" children={(field) => (
                        <FieldInput field={field} label="E-Mail" className="bg-white" />
                    )} />
                </form>
            </Dialog.Body>
            <Dialog.Footer>
                <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
                <contactForm.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            form={`contact-form-${contact?.id ?? "new"}`}
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
