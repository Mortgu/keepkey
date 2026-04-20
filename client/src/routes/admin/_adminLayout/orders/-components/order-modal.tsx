import Button from "@/components/button/button";
import Input from "@/components/inputs/input";
import Select from "@/components/select/select-modal";
import type { ContactPerson, Order, User } from "@/data/types";
import { useAdmin } from "@/hooks/admin";
import { useForm } from "@tanstack/react-form";
import { Loader } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

interface OrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    currentOrder?: any | null;
}

const orderSchema = z.object({
    voucherId: z.string(),
    date: z.date(),
    paymentTerm: z.string(),
    validUntil: z.date(),
    customerId: z.string(),
    supplierId: z.string(),
    requestFrom: z.string(),
});

const emptyOrder = {
    id: "",
    createdAt: new Date(),
    orderPositions: [],
    paymentTerm: "30 Days"
};

export default function OrderModal({ isOpen, onClose, onSubmit, currentOrder }: OrderModalProps) {
    if (!isOpen) return null;

    const { users } = useAdmin();
    const [selectedCustomer, setSelectedCustomer] = useState<User | undefined>(
        currentOrder?.user ? currentOrder.user : undefined
    );

    const orderForm = useForm({
        defaultValues: currentOrder || emptyOrder,
        validators: {
            onChange: orderSchema,
        }
    });

    const handleChange = (e: any) => {
        const userId = e.target.value;
        const selectedUser = users.find(u => u.id === userId);

        setSelectedCustomer(selectedUser)
    };

    return (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center p-4">
            <div className="p-4 relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                <form onSubmit={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    orderForm.handleSubmit();
                }} className="grid gap-4">

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <orderForm.Field name="customerId" children={(field) => (
                            <div className="flex-1 grid gap-2 items-center">
                                <label className="text-sm  text-gray-500" htmlFor={field.name}>Kunde:</label>
                                <select onChange={handleChange} className="w-full rounded-lg border border-gray-200 transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100">
                                    <option>None</option>
                                    {users?.map((user: User) => (
                                        <option key={user.id} value={user.id}>
                                            {user.firstName} {user.lastName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )} />

                        <div className="flex-1 grid gap-2 items-center">
                            {/* Unser Ansprechpartner select */}
                            <orderForm.Field name="customerId" children={(field) => (
                                <div className="flex-1 grid gap-2 items-center">
                                    <label className="text-sm  text-gray-500" htmlFor="">Ihr Ansprechpatner:</label>
                                    <select className="w-full rounded-lg border border-gray-200 transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100">
                                        <option>None</option>
                                        {selectedCustomer?.contactPersons.map((cp) => (
                                            <option key={cp.id} value={cp.id}>
                                                {cp.firstName} {cp.lastName}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )} />
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex-1 grid gap-2">
                            <label className="text-sm  text-gray-500" htmlFor="">Beleg-Nr.:</label>
                            <Input input_size="sm" />
                        </div>

                        <orderForm.Field name="createdAt" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <label className="text-sm  text-gray-500" htmlFor={field.name}>Datum:</label>
                                <Input type="date" id={field.name} input_size="sm" variant="secondary" value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)} />
                            </div>
                        )} />
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex-1 grid gap-2">
                            <label className="text-sm text-gray-500" htmlFor="">Zahlungsbedingung:</label>
                            <Input input_size="sm" placeholder="payment term..." />
                        </div>

                        <div className="flex-1 grid gap-2">
                            <label className="text-sm  text-gray-500" htmlFor="">Angebot gültig bis:</label>
                            <Input type="date" input_size="sm" variant="secondary" placeholder="Valid unitl..." />
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex-1 grid gap-2">
                            <label className="text-sm  text-gray-500" htmlFor="">Kunden-Nr.:</label>
                            <Input input_size="sm" />
                        </div>

                        <div className="flex-1 grid gap-2">
                            <label className="text-sm  text-gray-500" htmlFor="">Lieferanten-Nr.:</label>
                            <Input input_size="sm" variant="secondary" />
                        </div>
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div className="flex-1 grid gap-2">
                            <label className="text-sm  text-gray-500" htmlFor="">Ihre Anfrage vom:</label>
                            <Input type="date" input_size="sm" />
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button onClick={onClose} className="flex-1" type='button' size='md' variant='secondary'>Cancel</Button>
                        <orderForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                            <Button disabled={!canSubmit} className="flex-1" type='submit' size='md'>
                                {isSubmitting ? <Loader className="size-4" /> : 'Save'}
                            </Button>
                        )} />
                    </div>
                </form>
            </div>
        </div>
    )
}