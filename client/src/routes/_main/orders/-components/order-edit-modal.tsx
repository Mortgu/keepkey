import { Dot } from "lucide-react";
import { t } from "i18next";
import useOrderForm from "../-hooks/use-order-form";
import PurchasePriceTable from "./purchase-price-table";
import type { Order } from "@keepit/schemas";
import { getErrorMessage } from "@/lib/errors";
import { Button, Dialog, Input, Textarea } from "@/components";
import { getFormError } from "@/lib/utils";

interface Props {
    /** Zu bearbeitende Bestellung. Das Anlegen läuft über `modal/order-modal.tsx`. */
    order: Order;
    /** Abbrechen — schließt nur diesen Dialog. */
    onClose: () => void;
    /** Bestellung angelegt — schließt zusätzlich die darüberliegende Auswahl. */
    onCreated: () => void;
}

export default function OrderEditModal({ order, onClose, onCreated }: Props) {
    const { form, rows, error } = useOrderForm({
        onDone: onCreated,
        currentOrder: order,
    });

    const source = order;
    const formId = `order-form-${source.id}`;

    const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {

        e.preventDefault();

        e.stopPropagation();

        form.handleSubmit();

    };


    return (
        <Dialog defaultOpen onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
            <Dialog.Header title={t("orders.editTitle")} description={
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

                    <div className="flex items-center gap-4">
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

                        <form.Field name="contractStartDate" children={(field) => (
                            <Input
                                id={field.name}
                                type="date"
                                label={t("orders.contractStartDate")}
                                value={field.state.value}
                                error={getFormError(field.state.meta.errors)}
                                onChange={(e) => field.handleChange(e.target.value)}
                                onBlur={field.handleBlur}
                            />
                        )} />
                    </div>

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

                    <hr className="text-(--border)" />

                    {/* Einkaufsseite: Die Bestellung geht an den Zulieferer. */}
                    <form.Field name="positions" children={(field) => (
                        <PurchasePriceTable
                            rows={rows}
                            values={field.state.value}
                            disabled={Boolean(order.cancelledAt)}
                            onChange={(offerPositionId, purchaseCents) => field.handleChange(
                                field.state.value.map((p) => p.offerPositionId === offerPositionId
                                    ? { ...p, purchase_eur_user_month: purchaseCents }
                                    : p),
                            )}
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
                            disabled={!canSubmit || isSubmitting || Boolean(order.cancelledAt)}
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
