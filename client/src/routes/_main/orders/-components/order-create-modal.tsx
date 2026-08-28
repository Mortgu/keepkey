import { Dot } from "lucide-react";
import { t } from "i18next";
import useOrderForm from "../-hooks/use-order-form";
import type { Offer } from "@keepit/schemas";
import { formatDate } from "@/lib/format";
import { FormDialog, Input, Textarea } from "@/components";
import { getFormError } from "@/lib/utils";

interface Props {
    offer: Offer;
    /** Schließt den übergeordneten Auswahl-Dialog, sobald die Bestellung angelegt ist. */
    setOpen: (value: boolean) => void;
}

export default function OrderCreateModal({ offer, setOpen }: Props) {
    const { form } = useOrderForm({
        setOpen: setOpen,
        currentOfferId: offer.id,
    });

    return (
        <FormDialog
            form={form}
            formId={`order-form-${offer.id}`}
            title={`Bestellung für ${offer.quoteId}`}
            description={
                <>
                    {offer.customer.companyName}
                    <Dot size={18} />
                    {offer.customerContactPerson.firstName} {offer.customerContactPerson.lastName}
                </>
            }
            submitLabel={t("button.save")}
            trigger={
                <button
                    type="button"
                    className="w-full text-left border border-(--border) py-3 px-4 rounded-md cursor-pointer hover:bg-(--page-bg)"
                >
                    <span className="flex items-center gap-1">
                        <span className="text-md">[AG{offer.quoteId}]</span>
                        <span className="text-md">{offer.customer.companyName}</span>
                    </span>
                    <span className="flex items-center gap-0.5 text-sm">
                        <span>{offer.customerContactPerson.firstName} {offer.customerContactPerson.lastName}</span>
                        <Dot size={18} />
                        <span className="text-md">{formatDate(offer.createdAt)}</span>
                    </span>
                </button>
            }
        >
            <div className="flex items-center gap-4">
                <form.Field name="orderId" children={(field) => (
                    <Input
                        id={field.name}
                        name={field.name}
                        label="Bestell-Nr."
                        prefix="BE"
                        value={field.state.value}
                        error={getFormError(field.state.meta.errors)}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                    />
                )} />

                <form.Field name="projectNumber" children={(field) => (
                    <Input
                        id={field.name}
                        label="Projekt-Nr."
                        value={field.state.value}
                        onChange={(e) => field.handleChange(e.target.value)}
                        onBlur={field.handleBlur}
                    />
                )} />
            </div>

            <form.Field name="date" children={(field) => (
                <Input
                    id={field.name}
                    type="date"
                    label="Bestelldatum"
                    value={field.state.value}
                    error={getFormError(field.state.meta.errors)}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                />
            )} />

            <form.Field name="projectDescription" children={(field) => (
                <Textarea
                    id={field.name}
                    label="Projektbezug"
                    placeholder="Kurzbeschreibung des Projekts"
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                />
            )} />

            <form.Field name="orderDetails" children={(field) => (
                <Textarea
                    id={field.name}
                    label="Bestelldetails"
                    placeholder="Registrierung, Absprachen, etc."
                    value={field.state.value}
                    onChange={(e) => field.handleChange(e.target.value)}
                    onBlur={field.handleBlur}
                />
            )} />
        </FormDialog>
    );
}
