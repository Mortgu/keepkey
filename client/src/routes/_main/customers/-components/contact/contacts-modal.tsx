import { User } from "lucide-react";
import { useTranslation } from "react-i18next";
import ContactModal from "./contact-modal";
import ContactCard from "./contact-card";
import type { Contact } from "@keepit/schemas";
import { Button, Dialog, SearchBar } from "@/components";

interface Props {
    customerId: string;
    contacts: Array<Contact>;
}

export default function ContactsModal({ customerId, contacts }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog trigger={<Button variant="border" size="xs" icon={<User size={14} />} iconOnly />}>
            <Dialog.Header title="Kunden Kontaktpersonen" />

            <Dialog.Toolbar>
                <SearchBar value="" onChange={() => { }} />
                <ContactModal
                    customerId={customerId}
                    trigger={<Button size="sm">Kunden anlegen</Button>}
                />
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
        </Dialog>
    );
}
