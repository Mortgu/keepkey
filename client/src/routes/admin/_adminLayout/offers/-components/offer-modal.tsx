import Button from "@/components/button/button";
import Input from "@/components/inputs/input";
import type { BaseOffer, ContactPerson, Customer, ProductItem, Supplier } from "@/data/types";
import { useContracts } from "@/hooks/contract";
import { useCustomers } from "@/hooks/customer";
import { useProducts } from "@/hooks/product";
import { useForm } from "@tanstack/react-form";
import { Loader, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import OfferProductForm, { type OfferProductInput } from "./offer-product-form";
import { z } from "zod";
import { useOffer } from "@/hooks/offer";
import { useSupplier } from "@/hooks/supplier";

interface OfferModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const offerSchema = z.object({
    voucherId: z.string(),
    date: z.date(),
    paymentTerm: z.string(),
    validUntil: z.date(),
    customerId: z.string(),
    supplierId: z.string(),
    contactPersonId: z.string(),
    requestFrom: z.date(),
});

const emptyOfferFormVlues = {
    voucherId: "",
    supplierId: "",
    customerId: "",
    contactPersonId: "",

    date: new Date(),
    paymentTerm: "30 Tage",
    validUntil: new Date(),
    requestFrom: new Date(),
}

export default function OfferModal({ isOpen, onClose }: OfferModalProps) {
    const { customers } = useCustomers();
    const { products } = useProducts();
    const { contracts } = useContracts();
    const { suppliers } = useSupplier();

    const [offerProducts, setOfferProducts] = useState<OfferProductInput[]>([]);
    const [showProductForm, setShowProductForm] = useState(false);

    const { createOffer } = useOffer();

    const offerForm = useForm({
        defaultValues: emptyOfferFormVlues,
        validators: {
            onChange: offerSchema
        },
        onSubmit: async ({ value }) => {
            const offer: BaseOffer = {
                ...value,
            }

            onClose();

            return await createOffer({
                offer: offer, positions: offerProducts
            });
        }
    });

    const handleFormSubmit = (e: { preventDefault(): void; stopPropagation(): void }) => {
        e.preventDefault();
        e.stopPropagation();
        offerForm.handleSubmit();
    }

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center p-4">
            <div className="overflow-hidden relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center bg-gray-50 border-b border-gray-200 px-2 py-2">
                    <h1 className="text-xl ml-2">Neues Angebot erstellen.</h1>
                    <Button onClick={onClose} variant="secondary" size="sm" icon={<X className="size-4" />} iconOnly />
                </div>

                <div className="p-4">
                    <form onSubmit={handleFormSubmit} className="grid gap-4">

                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <offerForm.Field name="customerId" children={(field) => (
                                <div className="flex-1 grid gap-2 items-center">
                                    <label className="text-sm  text-gray-500" htmlFor={field.name}>Kunde:</label>
                                    <select
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100"
                                    >
                                        <option value="">None</option>
                                        {customers?.map((customer: Customer) => (
                                            <option key={customer.id} value={customer.id}>{customer.firstName} {customer.lastName}</option>
                                        ))}
                                    </select>
                                </div>
                            )} />

                            {/* Ihr Ansprechpartner */}
                            <offerForm.Field name="contactPersonId" children={(field) => (
                                <div className="flex-1 grid gap-2 items-center">
                                    <label className="text-sm  text-gray-500" htmlFor={field.name}>Ansprechpartner Kunde:</label>
                                    <offerForm.Subscribe selector={(state) => state.values.customerId} children={(customerId) => {
                                        const selectedCustomer = customers?.find((c: Customer) => c.id === customerId);
                                        const contactPersons = selectedCustomer?.contactPersons ?? [];

                                        return (
                                            <select
                                                value={field.state.value}
                                                onChange={(e) => field.handleChange(e.target.value)}
                                                disabled={!customerId}
                                                className="w-full rounded-lg border border-gray-200 transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100 disabled:opacity-50"
                                            >
                                                <option value="">None</option>
                                                {contactPersons.map((cp: ContactPerson) => (
                                                    <option key={cp.id} value={cp.id}>{cp.firstName} {cp.lastName}</option>
                                                ))}
                                            </select>
                                        );
                                    }} />
                                </div>
                            )} />
                        </div>

                        <div className="flex flex-wrap justify-between items-center gap-4">
                            <offerForm.Field name="voucherId" children={(field) => (
                                <div className="flex-1 grid gap-2 items-center">
                                    <label className="text-sm  text-gray-500" htmlFor={field.name}>Beleg-Nr:</label>
                                    <Input type="text" value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)} />
                                </div>
                            )} />

                            {/* Lieferant / Supplier */}
                            <offerForm.Field name="supplierId" children={(field) => (
                                <div className="flex-1 grid gap-2 items-center">
                                    <label className="text-sm  text-gray-500" htmlFor={field.name}>Lieferant:</label>
                                    <select value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        className="w-full rounded-lg border border-gray-200 transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100"
                                    >
                                        <option value="">None</option>
                                        {suppliers?.map((supplier: Supplier) => (
                                            <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )} />

                            {/* Zahlungsbedingung */}
                            <offerForm.Field name="paymentTerm" children={(field) => (
                                <div className="flex-1 grid gap-2">
                                    <label className="text-sm text-gray-500" htmlFor="">Zahlungsbedingung:</label>
                                    <Input input_size="sm" placeholder="Zahlungsbedingung..." value={field.state.value} onChange={(e) => field.handleChange(e.target.value)} />
                                </div>
                            )} />

                        </div>

                        <div className="flex flex-wrap justify-between items-center gap-4">
                            {/* Angebot Gültig bis */}
                            <offerForm.Field name="validUntil" children={(field) => (
                                <div className="flex-1 grid gap-2">
                                    <label className="text-sm text-gray-500" htmlFor="">Angebot gültig bis:</label>
                                    <Input type="date" input_size="sm" placeholder="Gültig bis..." value={new Date(field.state.value).toISOString().split('T')[0]} />
                                </div>
                            )} />

                            {/* Ihre Anfrage vom */}
                            <offerForm.Field name="requestFrom" children={(field) => (
                                <div className="flex-1 grid gap-2">
                                    <label className="text-sm text-gray-500" htmlFor="">Ihre Anfrage vom:</label>
                                    <Input type="date" input_size="sm" placeholder="Ihre Anfrage vom..." value={new Date(field.state.value).toISOString().split('T')[0]} />
                                </div>
                            )} />
                        </div>

                        <hr className="text-gray-200" />

                        <div className="grid gap-2">
                            <div className="w-full">
                                <Button
                                    onClick={() => setShowProductForm(true)}
                                    type="button"
                                    className="float-right"
                                    variant="link"
                                    icon={<Plus className="size-4" />}
                                    size="sm"
                                    disabled={showProductForm}
                                >
                                    Produkt hinzufügen
                                </Button>
                            </div>

                            {offerProducts.length === 0 && !showProductForm && (
                                <p className="text-sm text-gray-500 text-center py-2">Noch kein Produkt hinzugefügt</p>
                            )}

                            <div className="flex flex-col gap-2">
                                {offerProducts.map((op, index) => {
                                    const product = products?.find((p: ProductItem) => p.id === op.productId);
                                    return (
                                        <div key={index} className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-md px-3 py-2">
                                            <span className="text-sm text-gray-700">
                                                {product?.name} · {op.duration} · Menge: {op.quantity}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setOfferProducts((prev) => prev.filter((_, i) => i !== index))}
                                                className="text-gray-400 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="size-4" />
                                            </button>
                                        </div>
                                    );
                                })}

                                {showProductForm && (
                                    <OfferProductForm
                                        products={products ?? []}
                                        contracts={contracts ?? []}
                                        onSave={(data) => { setOfferProducts((prev) => [...prev, data]); setShowProductForm(false); }}
                                        onCancel={() => setShowProductForm(false)}
                                    />
                                )}
                            </div>
                        </div>

                        <hr className="text-gray-200" />

                        <div className="flex gap-2">
                            <Button onClick={onClose} className="flex-1" type='button' size='md' variant='secondary'>Abbrechen</Button>
                            <offerForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                                <Button disabled={!canSubmit} className="flex-1" type='submit' size='md'>
                                    {isSubmitting ? <Loader className="size-4" /> : 'Speichern'}
                                </Button>
                            )} />
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}