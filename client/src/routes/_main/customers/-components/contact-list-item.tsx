import { Pen, Settings, Trash } from "lucide-react";
import { tv } from "tailwind-variants";
import ContactPersonForm from "./contact-person-form";
import SalutationLineModal from "./salutation-line-modal";
import type { ContactPerson } from "@/types";
import { useDeleteCustomerContact, useModal, useUpdateCustomerContact } from "@/hooks";
import { Button } from "@/components";

type Props = {
    currentCustomerId: string;
    cp: ContactPerson;
};

export default function ContactListItem({ currentCustomerId, cp }: Props) {
    const editModal = useModal<ContactPerson>();
    const salutationModal = useModal<ContactPerson>();

    const { updateCustomerContact, isUpdatingCustomerContact } = useUpdateCustomerContact();
    const { deleteCustomerContact, isDeletingCustomerContact, errorDeletingCustomerContact } = useDeleteCustomerContact();

    const styles = tv({
        base: [
            "w-full flex items-center justify-between",
            "border-t border-(--border)",
            "px-4 py-3"
        ],
        variants: {
            error: {
                true: "bg-(--destructive-subtle) border-(--destructive)",
                false: ""
            }
        }
    })

    return (
        <div className="flex flex-col items-center">
            {errorDeletingCustomerContact && (
                <p className="text-sm text-(--destructive)">{errorDeletingCustomerContact.message}</p>
            )}

            <div className={styles({ error: errorDeletingCustomerContact !== null })}>
                <div className="grid">
                    <p className="text-sm">{cp.salutation} {cp.firstName} {cp.lastName}</p>
                    <p className="text-sm font-light text-(--text-secondary)">{cp.email}</p>
                </div>

                <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" icon={<Settings className="size-3.5" />} iconOnly
                        onClick={() => salutationModal.open(cp)} title="Anredezeile" />

                    <Button type="button" variant="secondary" size="sm" icon={<Pen className="size-3.5" />} iconOnly
                        onClick={() => editModal.open(cp)} loading={isUpdatingCustomerContact} />

                    <Button type="button" variant="secondary" size="sm" icon={<Trash className="size-3.5" />} iconOnly
                        loading={isDeletingCustomerContact}
                        onClick={() => deleteCustomerContact({
                            id: currentCustomerId, contactId: cp.id
                        })} />
                </div>
            </div>

            {editModal.isOpen && editModal.data && (
                <ContactPersonForm
                    key={editModal.key}
                    saveFn={(data) => {
                        updateCustomerContact({ id: currentCustomerId, contactId: cp.id, input: data });
                        editModal.close();
                    }}
                    cancelFn={editModal.close}
                    currentCustomerId={currentCustomerId}
                    currentContactPerson={editModal.data} />
            )}

            {salutationModal.isOpen && salutationModal.data && (
                <SalutationLineModal key={salutationModal.key}
                    contactPerson={salutationModal.data} onClose={salutationModal.close} />
            )}
        </div>
    )
}
