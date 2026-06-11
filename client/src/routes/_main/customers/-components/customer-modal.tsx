import {useForm} from "@tanstack/react-form";
import {z} from "zod";
import {useCustomerHook} from "@/hooks";
import {Button, Input, ModalDialog} from "@/components";
import type {Customer} from "@/types";
import {getFormError} from "@/lib/utils";

interface CustomerModalProps {
    onClose: () => void;
    currentCustomer?: Customer | null;
}

const customerSchema = z.object({
    customerId: z.union([z.string(), z.undefined()]).transform(val => val === undefined ? null : val),
    companyName: z.string().min(1, "min. 1 Zeichen!"),
    email: z.email(),
    invoiceEmail: z.union([z.email(), z.undefined()]).transform(val => val === undefined ? null : val),
    street: z.string(),
    city: z.string(),
    plz: z.string(),
    phone: z.string(),
});

export default function CustomerModal({onClose, currentCustomer = null}: CustomerModalProps) {
    const isEdit = currentCustomer !== null;

    const {updateCustomer, createCustomer, errorCreatingCustomer} = useCustomerHook();

    const customerForm = useForm({
        defaultValues: {
            customerId: currentCustomer?.customerId ?? undefined,
            companyName: currentCustomer?.companyName ?? "",
            email: currentCustomer?.email ?? "",
            invoiceEmail: currentCustomer?.invoiceEmail ?? undefined,
            street: currentCustomer?.street || "",
            city: currentCustomer?.city || "",
            plz: currentCustomer?.plz || "",
            phone: currentCustomer?.phone || "",
        },
        validators: {
            onChange: customerSchema,
        },
        onSubmit: ({value}) => {
            if (isEdit) {
                try {
                    updateCustomer({id: currentCustomer.id, body: value});
                    onClose();
                } catch (exception: any) {
                }
            } else {
                try {
                    createCustomer({body: value});
                    onClose();
                } catch (exception: any) {
                }
            }
        },
    });

    const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        customerForm.handleSubmit();
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">
                    {isEdit ? "Kunden bearbeiten" : "Neuen Kunden anlegen"}
                </h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                {errorCreatingCustomer && (
                    <div className="p-4 bg-red-50">
                        <p>{errorCreatingCustomer?.message}</p>
                    </div>
                )}

                <form id="customer-form" onSubmit={handleSubmit} className="grid gap-4">
                    <div className="flex items-center gap-4">
                        <customerForm.Field name="customerId" children={(field) => (
                            <div className="flex gap-2">
                                <Input id={field.name} label="Kunden-Nr." size="sm"
                                       value={field.state.value ?? ""} error={getFormError(field.state.meta.errors)}
                                       onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}/>

                        <customerForm.Field name="companyName" children={(field) => (
                            <div className="flex-3 grid gap-2">
                                <Input id={field.name} label="Firmenname" size="sm"
                                       value={field.state.value} error={getFormError(field.state.meta.errors)}
                                       onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}/>

                        <customerForm.Field name="phone" children={(field) => (
                            <div className="flex-2 grid gap-2">
                                <Input id={field.name} label="Telefonnummer" size="sm"
                                       value={field.state.value} error={getFormError(field.state.meta.errors)}
                                       onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}/>
                    </div>

                    <div className="flex items-center gap-4">
                        <customerForm.Field name="email" children={(field) => (
                            <div className="flex-2 grid gap-2">
                                <Input id={field.name} label="E-Mail" size="sm"
                                       value={field.state.value} error={getFormError(field.state.meta.errors)}
                                       onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}/>

                        <customerForm.Field name="invoiceEmail" children={(field) => (
                            <div className="flex-2 grid gap-2">
                                <Input id={field.name} label="Rechnungs E-Mail" size="sm"
                                       value={field.state.value ?? ""} error={getFormError(field.state.meta.errors)}
                                       onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}/>


                    </div>

                    <div className="flex items-center gap-4">
                        <customerForm.Field name="street" children={(field) => (
                            <div className="flex-2 grid gap-2">
                                <Input id={field.name} size="sm" label="Straße"
                                       value={field.state.value} error={getFormError(field.state.meta.errors)}
                                       onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}/>

                        <customerForm.Field name="city" children={(field) => (
                            <div className="flex-2 grid gap-2">
                                <Input id={field.name} size="sm" label="Stadt"
                                       value={field.state.value} error={getFormError(field.state.meta.errors)}
                                       onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}/>

                        <customerForm.Field name="plz" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <Input id={field.name} size="sm" label="Postleitzahl"
                                       value={field.state.value} error={getFormError(field.state.meta.errors)}
                                       onChange={(e) => field.handleChange(e.target.value)}
                                />
                            </div>
                        )}/>
                    </div>
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button onClick={onClose} variant="secondary" size="sm">
                    Abbrechen
                </Button>
                <customerForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}
                                        children={([canSubmit, isSubmitting]) => (
                                            <Button size="sm" form="customer-form" disabled={!canSubmit}
                                                    loading={isSubmitting}>
                                                Speichern
                                            </Button>
                                        )}/>
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
