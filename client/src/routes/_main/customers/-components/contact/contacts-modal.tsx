import { dialogStyles } from "@/comp/dialog";
import { Button, SearchBar } from "@/components";
import { Dialog } from "@base-ui/react";
import { User, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContactModal from "./contact-modal";
import type { Contact } from "@keepit/schemas";
import ContactCard from "./contact-card";

interface Props {
    customerId: string;
    contacts: Array<Contact>;
}

export default function ContactsModal({ customerId, contacts }: Props) {
    const { t } = useTranslation();

    const styles = dialogStyles();

    return (
        <Dialog.Root>
            <Dialog.Trigger render={
                <Button variant="border" size="xs" icon={<User size={14} />} iconOnly />
            } />
            <Dialog.Portal>
                <Dialog.Backdrop className={styles.backdrop()} />
                <Dialog.Popup className={styles.popup()}>
                    {/* Header */}
                    <div className={styles.header()}>
                        <div className="">
                            <Dialog.Title className={styles.title()}>Kunden Kontaktpersonen</Dialog.Title>
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

                    {/* Filters */}
                    <div className={styles.filters()}>
                        <SearchBar value="" onChange={() => { }} />
                        <ContactModal customerId={customerId} render={
                            <Button size="sm">Kunden anlegen</Button>
                        } />
                    </div>

                    {/* Content */}
                    <div className={styles.body()}>
                        <div className="grid gap-4">
                            {contacts.map(contact => (
                                <ContactCard
                                    key={contact.id}
                                    customerId={customerId}
                                    contact={contact}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={styles.footer()}>
                        <Dialog.Close render={<Button variant="border" size='sm'>{t("button.cancel")}</Button>} />
                    </div>
                </Dialog.Popup>
            </Dialog.Portal>
        </Dialog.Root>
    )
}