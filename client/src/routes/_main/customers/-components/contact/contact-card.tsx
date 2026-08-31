import { Pen, Trash } from "lucide-react";
import ContactModal from "./contact-modal";
import type { Contact } from "@keepit/schemas";
import { Button } from "@/components";
import { useDeleteCustomerContact, useModal } from "@/hooks";

interface Props {
    customerId: string;
    contact: Contact;
}

export default function ContactCard({ customerId, contact }: Props) {
    const { deleteCustomerContact, isDeletingCustomerContact } = useDeleteCustomerContact();
    const editModal = useModal();

    return (
        <div className="border border-(--border) rounded-md overflow-hidden px-3 py-2 bg-white">
            <div className="flex items-center justify-between">
                <div className="grid">
                    <p className="text-md">
                        {contact.salutation} {contact.firstName} {contact.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{contact.email}</p>
                </div>

                <div className="flex items-center justify-center gap-2">
                    <Button
                        variant="border"
                        size="sm"
                        icon={<Pen size={14} />}
                        iconOnly
                        onClick={() => editModal.open()}
                    />

                    <Button
                        variant="secondary"
                        size="sm"
                        danger
                        icon={<Trash size={14} />}
                        iconOnly
                        onClick={() => deleteCustomerContact({
                            id: customerId, contactId: contact.id,
                        })}
                        loading={isDeletingCustomerContact}
                    />
                </div>
            </div>

            {editModal.isOpen && (
                <ContactModal
                    key={editModal.key}
                    customerId={customerId}
                    contact={contact}
                    onClose={editModal.close}
                />
            )}
        </div>
    )
}