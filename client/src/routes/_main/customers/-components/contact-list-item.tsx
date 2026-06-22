import { Pen, Trash } from "lucide-react";
import { useState } from "react";
import { tv } from "tailwind-variants";
import ContactPersonForm from "./contact-person-form";
import type { ContactPerson } from "@/types";
import { useCustomerHook } from "@/hooks";
import { Button } from "@/components";

type Props = {
    currentCustomerId: string;
    cp: ContactPerson;
};

export default function ContactListItem({ currentCustomerId, cp }: Props) {
    const [isEditing, setEditing] = useState<boolean>(false);

    const { updateContact, isUpdatingContact, deleteContact, isDeletingContact, errorDeletingContact } = useCustomerHook();

    const styles = tv({
        base: [
            "flex items-center justify-between",
            "bg-(--subtle-50) border border-(--border) rounded-md",
            "px-3 py-2"
        ],
        variants: {
            error: {
                true: "bg-(--destructive-subtle) border-(--destructive)",
                false: ""
            }
        }
    })

    return (
        <div className="grid gap-2">
            {errorDeletingContact && (
                <p className="text-sm text-(--destructive)">{errorDeletingContact.message}</p>
            )}

            <div className={styles({ error: errorDeletingContact !== null })}>
                <div className="grid">
                    <p className="text-sm">{cp.salutation} {cp.firstName} {cp.lastName}</p>
                    <p className="text-sm font-light text-(--text-secondary)">{cp.email}</p>
                </div>

                <div className="flex gap-2">
                    <Button type="button" variant="secondary" size="sm" icon={<Pen className="size-3.5" />} iconOnly
                        onClick={() => setEditing(true)} loading={isUpdatingContact} />

                    <Button type="button" variant="secondary" size="sm" icon={<Trash className="size-3.5" />} iconOnly
                        loading={isDeletingContact}
                        onClick={() => deleteContact({ id: cp.id })} />
                </div>
            </div>

            {isEditing && (
                <ContactPersonForm saveFn={(data) => {
                    updateContact({ id: cp.id, body: data });
                    setEditing(false);
                }} cancelFn={() => setEditing(false)}
                    currentCustomerId={currentCustomerId} currentContactPerson={cp} />
            )}
        </div>
    )
}