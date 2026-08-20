import { dialogStyles } from "@/comp/dialog";
import { Button } from "@/components";
import { Dialog } from "@base-ui/react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContactPersonForm from "../contact-person-form";
import { useState, type ReactElement } from "react";
import type { Contact } from "@keepit/schemas";

interface Props {
    customerId: string;
    contact?: Contact | null;
    render: ReactElement;
}

export default function ContactModal({ customerId, contact, render }: Props) {
    const { t } = useTranslation();

    const [open, setOpen] = useState(false);

    const styles = dialogStyles();

    return (
        <Dialog.Root open={open} onOpenChange={setOpen}>
            <Dialog.Trigger render={render} />
            <Dialog.Portal>
                <Dialog.Backdrop className={styles.backdrop()} />
                <Dialog.Popup className={styles.popup()}>
                    {/* Header */}
                    <div className={styles.header()}>
                        <div className="">
                            <Dialog.Title className={styles.title()}>Test</Dialog.Title>
                            <Dialog.Description className={styles.description()}></Dialog.Description>
                        </div>

                        <Dialog.Close render={
                            <Button
                                variant="border"
                                size="xs"
                                icon={<X size={14} />}
                                iconOnly
                            />
                        } />
                    </div>

                    {/* Content */}
                    <div className={styles.body()}>
                        <ContactPersonForm
                            cancelFn={() => setOpen(false)}
                            currentCustomerId={customerId}
                            currentContactPerson={contact}
                        />
                    </div>

                    {/* Footer */}
                    <div className={styles.footer()}>
                        <Dialog.Close render={<Button variant="border" size='sm'>{t("button.cancel")}</Button>} />
                        <Button variant="primary" size='sm'>{t("button.save")}</Button>
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    )
}