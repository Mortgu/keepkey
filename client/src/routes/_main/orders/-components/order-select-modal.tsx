import { buttonStyles, dialogStyles } from "@/components";
import { Dialog, ScrollArea, type DialogRootChangeEventDetails } from "@base-ui/react";
import { Plus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { useOffers } from "@/hooks";
import CustomerAutocomplete from "../../customers/-components/customer-autocomplete";
import { useCustomerFilters } from "../../customers/-page.hooks";
import OrderCreateModal from "./order-create-modal";

export default function OrderModal() {
    const { t } = useTranslation();
    const { items: offers } = useOffers();
    const filters = useCustomerFilters();

    const styles = dialogStyles();

    const [open, setOpen] = useState<boolean>(false);

    const handleOnOpenChange = (nextOpen: boolean, eventDetails: DialogRootChangeEventDetails) => {
        if (eventDetails.reason === 'outside-press' || eventDetails.reason === 'focus-out') {
            return;
        }

        setOpen(nextOpen);
    }

    return (
        <Dialog.Root open={open} onOpenChange={handleOnOpenChange}>
            <Dialog.Trigger className={buttonStyles({ variant: 'primary', size: 'sm' })}>
                <Plus size={14} strokeWidth={2.5} /> {t("button.create")}
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Backdrop className={styles.Backdrop()} />
                <Dialog.Viewport className={styles.Viewport()}>
                    <Dialog.Popup className={styles.Popup()}>
                        {/* Header */}
                        <div className={styles.Header()}>
                            <div className='grid'>
                                <Dialog.Title className={styles.Title()}>Bestellung für ---</Dialog.Title>
                            </div>

                            <Dialog.Close className={buttonStyles({ variant: 'border', size: 'xs', iconOnly: true })}>
                                <X size={14} />
                            </Dialog.Close>
                        </div>

                        <div className="px-4 pt-4">
                            <CustomerAutocomplete
                                items={offers.map(offer => ({
                                    title: offer.quoteId,
                                    description: `${offer.customerContactPerson.firstName} ${offer.customerContactPerson.lastName}`
                                }))}
                                filters={filters}
                            />
                        </div>

                        <ScrollArea.Root className={styles.Body()}>
                            <ScrollArea.Viewport className={styles.BodyViewport()}>
                                <ScrollArea.Content className={styles.BodyContent()}>
                                    {offers.map(offer => (
                                        <OrderCreateModal
                                            offer={offer}
                                            setOpen={setOpen}
                                        />
                                    ))}
                                </ScrollArea.Content>
                            </ScrollArea.Viewport>
                        </ScrollArea.Root>

                        {/* Footer */}
                        <div className={styles.Actions()}>
                            <Dialog.Close className={buttonStyles({ variant: 'border', size: 'sm' })}>
                                {t("button.cancel")}
                            </Dialog.Close>
                        </div>
                    </Dialog.Popup>
                </Dialog.Viewport>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
