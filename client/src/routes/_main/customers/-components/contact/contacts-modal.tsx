import { useTranslation } from "react-i18next";
import ContactModal from "./contact-modal";
import ContactCard from "./contact-card";
import type { Contact } from "@keepit/schemas";
import { Button, Dialog, SearchBar } from "@/components";
import { useModal } from "@/hooks";

interface Props {
    customerId: string;
    contacts: Array<Contact>;
    onClose: () => void;
}

export default function ContactsModal({ customerId, contacts, onClose }: Props) {
    const { t } = useTranslation();
    const contactModal = useModal();

    return (
        <Dialog defaultOpen onOpenChange={(nextOpen) => { if (!nextOpen) onClose(); }}>
            <Dialog.Header title="Kunden Kontaktpersonen" />

            <Dialog.Toolbar>
                <SearchBar value="" onChange={() => { }} />
                <Button size="sm" onClick={() => contactModal.open()}>Kunden anlegen</Button>
            </Dialog.Toolbar>

            <Dialog.Body className="gap-4">
                {contacts.map(contact => (
                    <ContactCard
                        key={contact.id}
                        customerId={customerId}
                        contact={contact}
                    />
                ))}
            </Dialog.Body>

            <Dialog.Footer>
                <Dialog.Close render={<Button variant="border" size="sm">{t("button.cancel")}</Button>} />
            </Dialog.Footer>

            {contactModal.isOpen && (
                <ContactModal
                    key={contactModal.key}
                    customerId={customerId}
                    onClose={contactModal.close}
                />
            )}
        </Dialog>
    );
}
