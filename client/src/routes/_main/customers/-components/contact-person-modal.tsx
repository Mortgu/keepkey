import { Button, Input, ModalDialog } from "@/components";
import type { ContactPerson } from "@/types";
import { Pen, Plus, Trash } from "lucide-react";
import { useState } from "react";
import ContactPersonForm from "./contact-person-form";
import ContactListItem from "./contact-list-item";
import { useCustomerHook } from "@/hooks";

type ContactPersonModalProps = {
    open: boolean;
    cancelFn: () => void;

    currentCustomerId: string;
    currentContactPersons?: ContactPerson[];
};

export default function ContactPersonModal({ open, cancelFn, currentCustomerId, currentContactPersons }: ContactPersonModalProps) {
    const [add, setAdd] = useState<boolean>(false);

    const { createContact } = useCustomerHook();

    return (
        <ModalDialog open={open} cancelFn={cancelFn}>
            <ModalDialog.Header>
                <h1 className="text-lg">Kunden Kontaktpersonen</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <div className="grid gap-4">
                    <div className="flex items-center gap-2 w-full ml-auto">
                        <Input placeholder="Suchen..." />

                        <div className="min-w-fit">
                            <Button type="button" variant="primary" size="sm" icon={<Plus className="size-3.5" />}
                                onClick={() => setAdd(true)} disabled={add}>
                                Kontaktperson hinzufügen
                            </Button>
                        </div>
                    </div>

                    {currentContactPersons?.map((cp, index) => (
                        <ContactListItem key={index} cp={cp} currentCustomerId={currentCustomerId} />
                    ))}

                    {add && (
                        <ContactPersonForm saveFn={(data) => {
                            createContact(data);
                            setAdd(false);
                        }} cancelFn={() => setAdd(false)} currentCustomerId={currentCustomerId} />
                    )}
                </div>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button variant="primary" size="sm" onClick={cancelFn}>Schließen</Button>
            </ModalDialog.Footer>
        </ModalDialog>
    )
}