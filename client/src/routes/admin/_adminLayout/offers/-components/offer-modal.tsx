import Button from "@/components/button/button";
import Input from "@/components/inputs/input";
import type { ProductItem, ShoppingCartItem, User } from "@/data/types";
import { useAdmin } from "@/hooks/admin";
import { useContracts } from "@/hooks/contract";
import { useProducts } from "@/hooks/product";
import { useForm } from "@tanstack/react-form";
import { Loader, Plus } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { z } from "zod";

interface OfferModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: () => void;
}

export const offerSchema = z.object({
    voucherId: z.string(),
    date: z.date(),
    paymentTerm: z.string(),
    validUntil: z.date(),
    customerId: z.string(),
    supplierId: z.string(),
    requestFrom: z.date(),
});

const emptyOfferFormVlues = {
    voucherId: "",
    supplierId: "",

    paymentTerm: "30 Tage",
    validUntil: new Date(),
    requestFrom: new Date(),
}

export default function OfferModal({ isOpen, onClose, onSubmit }: OfferModalProps) {
    if (!isOpen) return null;

    const { users } = useAdmin();
    const { products } = useProducts();
    const { contracts } = useContracts();

    const [selectedProducts, setSelectedProducts] = useState<{}>([])

    const offerForm = useForm({
        defaultValues: emptyOfferFormVlues,
        validators: {
            onChange: offerSchema
        }
    });

    const handleFormSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        offerForm.handleSubmit();
    }

    return (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center p-4">
            <div className="p-4 relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                <form onSubmit={handleFormSubmit} className="grid gap-4">

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <offerForm.Field name="voucherId" children={(field) => (
                            <div className="flex-1 grid gap-2 items-center">
                                <label className="text-sm  text-gray-500" htmlFor={field.name}>Beleg-Nr:</label>
                                <Input type="text" value={field.state.value} />
                            </div>
                        )} />

                        <offerForm.Field name="supplierId" children={(field) => (
                            <div className="flex-1 grid gap-2 items-center">
                                <label className="text-sm  text-gray-500" htmlFor={field.name}>Kunde:</label>
                                <select className="w-full rounded-lg border border-gray-200 transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100">
                                    <option>None</option>
                                    {users?.map((user: User) => (
                                        <option>{user.firstName} {user.lastName}</option>
                                    ))}
                                </select>
                            </div>
                        )} />

                        {/* Ihr Ansprechpartner */}
                        <offerForm.Field name="supplierId" children={(field) => (
                            <div className="flex-1 grid gap-2 items-center">
                                <label className="text-sm  text-gray-500" htmlFor={field.name}>Ansprechpartner Kunde:</label>
                                <select className="w-full rounded-lg border border-gray-200 transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100">
                                    <option>None</option>
                                </select>
                            </div>
                        )} />
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        {/* Zahlungsbedingung */}
                        <offerForm.Field name="paymentTerm" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <label className="text-sm text-gray-500" htmlFor="">Zahlungsbedingung:</label>
                                <Input input_size="sm" placeholder="Zahlungsbedingung..." value={field.state.value} />
                            </div>
                        )} />

                        {/* Angebot Gültig bis */}
                        <offerForm.Field name="validUntil" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <label className="text-sm text-gray-500" htmlFor="">Angebot gültig bis:</label>
                                <Input type="date" input_size="sm" placeholder="Gültig bis..." value={new Date(field.state.value).toISOString().split('T')[0]} />
                            </div>
                        )} />
                    </div>

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        {/* Ihre Anfrage vom */}
                        <offerForm.Field name="requestFrom" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <label className="text-sm text-gray-500" htmlFor="">Ihre Anfrage vom:</label>
                                <Input type="date" input_size="sm" placeholder="Ihre Anfrage vom..." value={new Date(field.state.value).toISOString().split('T')[0]} />
                            </div>
                        )} />
                    </div>

                    <hr />

                    <div className="grid gap-2">
                        <div className="grid gap-2">
                            {selectedProducts.map(i => (
                                <div className="flex items-center gap-2 bg-gray-50 p-1 rounded-md">
                                    <select className="w-full rounded-lg border border-gray-200 transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100">
                                        {products?.map((product: ProductItem) => (
                                            <option>{product.name}</option>
                                        ))}
                                    </select>
                                    <select className="w-full rounded-lg border border-gray-200 transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100">
                                        <option>None</option>
                                    </select>
                                    <select className="w-full rounded-lg border border-gray-200 transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100">
                                        <option>None</option>
                                    </select>
                                </div>
                            ))}
                        </div>

                        <Button onClick={() => setSelectedProducts([...selectedProducts, { quantity: 1, duration: 1, product: products[0], contract: contracts[0] }])} variant="secondary" size="md" className="w-full">
                            <Plus className="size-4" /> Produkt hinzufügen
                        </Button>

                    </div>

                    <div className="flex gap-4">
                        <Button onClick={onClose} className="flex-1" type='button' size='md' variant='secondary'>Cancel</Button>
                        <offerForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
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