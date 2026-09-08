import { Dot } from "lucide-react";
import { t } from "i18next";
import useOrderForm from "../-hooks/use-order-form";
import type { Offer, Order } from "@keepit/schemas";
import { getErrorMessage } from "@/lib/errors";
import { Button, Dialog, Input, Textarea } from "@/components";
import { getFormError } from "@/lib/utils";

interface Props {
    offer?: Offer;
    order?: Order;
    /** Abbrechen — schließt nur diesen Dialog. */
    onClose: () => void;
    /** Bestellung angelegt — schließt zusätzlich die darüberliegende Auswahl. */
    onCreated: () => void;
}

export default function OrderCreateModal({ offer, order, onClose, onCreated }: Props) {
    const { form, error } = useOrderForm({
        onDone: onCreated,
        currentOffer: offer,
        currentOrder: order,
    });

    const source = order ?? offer!;
    const formId = `order-form-${source.id}`;

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {

        e.preventDefault();

        e.stopPropagation();

        form.handleSubmit();

    };


    return (
        <Dialog defaultOpen onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
            <Dialog.Header title={order ? t("orders.editTitle") : t("orders.createTitle", { quoteId: offer?.quoteId })} description={
                <>
                    {source.customer.companyName}
                    <Dot size={18} />
                    {source.customerContactPerson.firstName} {source.customerContactPerson.lastName}
                </>
            } />
            <Dialog.Body>
                <p className="text-sm text-(--text-secondary)">{t("orders.fixedOffer")}</p>
                {error && <p role="alert" className="text-sm text-(--destructive)">{getErrorMessage(error)}</p>}
                <form id={formId} onSubmit={handleSubmit} className="grid gap-4">
                    <div className="flex items-center gap-4">
                        <form.Field name="orderId" children={(field) => (
                            <Input
                                id={field.name}
                                name={field.name}
                                label={t("orders.number")}
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
                                label={t("orders.projectNumber")}
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
                            label={t("orders.date")}
                            value={field.state.value}
                            error={getFormError(field.state.meta.errors)}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                    )} />

                    <form.Field name="projectDescription" children={(field) => (
                        <Textarea
                            id={field.name}
                            label={t("orders.projectDescription")}

                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
                        />
                    )} />

                    <form.Field name="orderDetails" children={(field) => (
                        <Textarea
                            id={field.name}
                            label={t("orders.details")}

                            value={field.state.value}
                            onChange={(e) => field.handleChange(e.target.value)}
                            onBlur={field.handleBlur}
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
                            form={formId}
                            size="sm"
                            disabled={!canSubmit || isSubmitting || Boolean(order?.cancelledAt) || Boolean(offer?.acceptedAt)}
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
