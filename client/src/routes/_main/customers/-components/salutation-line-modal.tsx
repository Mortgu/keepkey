import { useForm } from "@tanstack/react-form";
import type { Contact } from "@keepit/schemas";
import { FormDialog, Textarea } from "@/components";

interface SalutationLineModalProps {
    onClose: () => void;
    contactPerson: Contact;
}

export default function SalutationLineModal({ onClose, contactPerson }: SalutationLineModalProps) {
    const form = useForm({
        defaultValues: {
            salutationLine: "",
        },
        onSubmit: () => {
            onClose();
        },
    });

    const fullName = `${contactPerson.salutation ? contactPerson.salutation + " " : ""}${contactPerson.firstName} ${contactPerson.lastName}`;

    return (
        <FormDialog
            form={form}
            defaultOpen
            onClose={onClose}
            formId="salutation-line-form"
            title="Anredezeile"
            description={fullName}
        >
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
        </FormDialog>
    );
}
