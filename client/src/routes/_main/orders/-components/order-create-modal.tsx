import { Dialog } from "@base-ui/react";
import { Dot, X } from "lucide-react";
import { t } from "i18next";
import useOrderForm from "../-hooks/use-order-form";
import type { Offer } from "@keepit/schemas";
import { formatDate } from "@/lib/format";
import { Button, Input, Textarea, buttonStyles, dialogStyles } from "@/components";
import { getFormError } from "@/lib/utils";

interface Props {
    offer: Offer;
    setOpen: (value: boolean) => void;
}

export default function OrderCreateModal({ offer, setOpen }: Props) {
    const styles = dialogStyles();

    const { form, handleSubmit } = useOrderForm({
        setOpen: setOpen,
        currentOfferId: offer.id,
    });

    return (
        <Dialog.Root>
            <Dialog.Trigger>
                <div className="border border-(--border) py-3 px-4 rounded-md cursor-pointer hover:bg-(--page-bg)">
                    <div className="flex items-center gap-1">
                        <p className="text-md">[AG{offer.quoteId}]</p>
                        <p className="text-md">{offer.customer.companyName}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-sm">
                        <p className="">{offer.customerContactPerson.firstName} {offer.customerContactPerson.lastName}</p>
                        <Dot size={18} />
                        <p className="text-md">{formatDate(offer.createdAt)}</p>
                    </div>
                </div>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Backdrop className={styles.Backdrop()} />
                <Dialog.Viewport className={styles.Viewport()}>
                    <Dialog.Popup className={styles.Popup()}>
                        {/* Header */}
                        <div className={styles.Header()}>
                            <div className='grid'>
                                <Dialog.Title className={styles.Title()}>Bestellung für {offer.quoteId}</Dialog.Title>
                                <Dialog.Description className={styles.Description()}>
                                    {offer.customer.companyName}
                                    <Dot size={18} />
                                    {offer.customerContactPerson.firstName} {offer.customerContactPerson.lastName}
                                </Dialog.Description>
                            </div>

                            <Dialog.Close className={buttonStyles({ variant: 'border', size: 'xs', iconOnly: true })}>
                                <X size={14} />
                            </Dialog.Close>
                        </div>

                        <div className="p-4">
                            <form id="order-form" onSubmit={handleSubmit} className="grid gap-4">
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
                            </form>
                        </div>

                        {/* Footer */}
                        <div className={styles.Actions()}>
                            <Dialog.Close className={buttonStyles({ variant: 'border', size: 'sm' })}>
                                {t("button.cancel")}
                            </Dialog.Close>

                            <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                                <Button type="submit" form="order-form" size="sm" disabled={!canSubmit} loading={isSubmitting}>
                                    {t("button.save")}
                                </Button>
                            )} />
                        </div>
                    </Dialog.Popup>
                </Dialog.Viewport>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
