import { useForm } from "@tanstack/react-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { Contact } from "@keepit/schemas";
import type { TranslationKey } from "@/i18n";
import { useCreateCustomerContact, useUpdateCustomerContact } from "@/hooks";
import { Button, Dialog, FieldInput } from "@/components";

const contactPersonSchema = z.object({
    salutation: z.string().min(1, "customer.validation.salutationMissing" satisfies TranslationKey),
    firstName: z.string().min(1, "customer.validation.firstNameMissing" satisfies TranslationKey),
    lastName: z.string().min(1, "customer.validation.lastNameMissing" satisfies TranslationKey),
    email: z.email("validation.email" satisfies TranslationKey).nullable(),
});

interface Props {
    customerId: string;
    contact?: Contact | null;
    onClose: () => void;
}

export default function ContactModal({ customerId, contact, onClose }: Props) {
    const { t } = useTranslation();
    const { createCustomerContact } = useCreateCustomerContact();
    const { updateCustomerContact } = useUpdateCustomerContact();

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

            onClose();
        },
    });

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {

        e.preventDefault();

        e.stopPropagation();

        contactForm.handleSubmit();

    };


    return (
        <Dialog
            defaultOpen
            size="lg"
            onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}
        >
            <Dialog.Header title={contact ? t("customer.contact.editTitle") : t("customer.contact.createTitle")} />
            <Dialog.Body>
                <form id={`contact-form-${contact?.id ?? "new"}`} onSubmit={handleSubmit} className="grid gap-4">
                    <div className="flex items-center gap-2">
                        <contactForm.Field name="salutation" children={(field) => (
                            <FieldInput field={field} label={t("customer.contact.salutation")} className="bg-white" />
                        )} />

                        <contactForm.Field name="firstName" children={(field) => (
                            <FieldInput field={field} label={t("customer.contact.firstName")} className="bg-white" />
                        )} />

                        <contactForm.Field name="lastName" children={(field) => (
                            <FieldInput field={field} label={t("customer.contact.lastName")} className="bg-white" />
                        )} />
                    </div>

                    <contactForm.Field name="email" children={(field) => (
                        <FieldInput field={field} label={t("customer.modal.email")} className="bg-white" />
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
