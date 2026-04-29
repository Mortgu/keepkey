import Button from "@/components/button/button";
import Input from "@/components/inputs/input";
import type {
    FlatRateBase,
    BaseOffer,
    ContactPerson,
    Customer,
    ProductItem,
    Supplier,
    User,
    FlatRate
} from "@/data/types";
import { useContracts } from "@/hooks/contract";
import { useCustomers } from "@/hooks/customer";
import { useProducts } from "@/hooks/product";
import { useForm } from "@tanstack/react-form";
import { Loader, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import OfferProductForm, { type OfferProductInput } from "./offer-product-form";
import OfferFlatRateForm from "./offer-flat-rate-form";
import { z } from "zod";
import { useOffer } from "@/hooks/offer";
import { useSupplier } from "@/hooks/supplier";
import { useAdmin } from "@/hooks/admin";
import ModalDialog from "@/components/modal";
import Checkbox from "@/components/inputs/checkbox.tsx";
import { useFlatRates } from "@/hooks/flatrate.ts";

interface OfferModalProps {
    open: boolean;
    cancelFn: () => void;
}

export const offerSchema = z.object({
    voucherId: z.string().min(1),
    date: z.date(),
    paymentTerm: z.string().min(1),
    validUntil: z.date().nullable(),
    customerId: z.string().min(1),
    supplierId: z.string().min(1),
    contactPersonId: z.string().min(1),
    requestFrom: z.date().nullable(),
    userId: z.string().min(1),
});

const emptyOfferFormVlues = {
    voucherId: "",
    supplierId: "",
    customerId: "",
    contactPersonId: "",
    userId: "",

    date: new Date(),
    paymentTerm: "30 Tage",
    validUntil: null as Date | null,
    requestFrom: null as Date | null,
}

export default function OfferModal({ open, cancelFn }: OfferModalProps) {
    const { customers } = useCustomers();
    const { products } = useProducts();
    const { contracts } = useContracts();
    const { suppliers } = useSupplier();
    const { users } = useAdmin();
    const { flatRates } = useFlatRates();

    const [offerProducts, setOfferProducts] = useState<OfferProductInput[]>([]);
    const [showProductForm, setShowProductForm] = useState(false);

    const [offerFlatRates, setOfferFlatRates] = useState<FlatRateBase[]>([]);
    const [showFlatRateForm, setShowFlatRateForm] = useState(false);

    const { createOffer, errorCreatingOffer } = useOffer();

    const offerForm = useForm({
        defaultValues: emptyOfferFormVlues,
        validators: {
            onChange: offerSchema,
            onMount: offerSchema,
        },
        onSubmit: async ({ value }) => {
            const offer: BaseOffer = {
                ...value,
            }

            try {
                const response = await createOffer({
                    offer: offer, positions: offerProducts, flatrates: offerFlatRates
                });

                cancelFn();

                return response;
            } catch (exception: any) {

            }

            //console.log({ offer, positions: offerProducts, flatrates: offerFlatRates });
        }
    });

    const handleFormSubmit = (e: { preventDefault(): void; stopPropagation(): void }) => {
        e.preventDefault();
        e.stopPropagation();
        offerForm.handleSubmit();
    }

    return (
        <ModalDialog open={open} cancelFn={cancelFn}>
            <ModalDialog.Header>
                <h1 className="text-lg">Neues Angebot erstellen</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                {errorCreatingOffer && (
                    <div className="pb-8 ">
                        <p className="text-(--destructive) bg-(--destructive-subtle) p-2 rounded-md border border-(--destructive)">{errorCreatingOffer.message}</p>
                    </div>
                )}

                <form id="offer-form" onSubmit={handleFormSubmit} className="grid gap-4">

                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <offerForm.Field name="customerId" children={(field) => (
                            <div className="flex-1 grid gap-2 items-center">
                                <label className="text-sm  text-gray-500" htmlFor={field.name}>Kunde:</label>
                                <select
                                    value={field.state.value}
                                    onChange={(e) => field.handleChange(e.target.value)}
                                    className="w-full rounded-lg border border-(--border) transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100"
                                >
                                    <option value="">None</option>
                                    {customers?.map((customer: Customer) => (
                                        <option key={customer.id} value={customer.id}>{customer.companyName}</option>
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
                                            className="w-full rounded-lg border border-(--border) transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100 disabled:opacity-50"
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

                        <offerForm.Field name="userId" children={(field) => (
                            <div className="flex-1 grid gap-2 items-center">
                                <label className="text-sm  text-gray-500" htmlFor={field.name}>Unser Ansprechpartner:</label>
                                <select value={field.state.value} onChange={(e) => field.handleChange(e.target.value)}
                                    className="w-full rounded-lg border border-(--border) transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100 disabled:opacity-50">
                                    <option value="">None</option>
                                    {users.map((user: User) => (
                                        <option key={user.id} value={user.id}>{user.firstName} {user.lastName}</option>
                                    ))}
                                </select>
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
                                    className="w-full rounded-lg border border-(--border) transition-all duration-200 px-3 py-2 text-base outline-none focus:bg-gray-100"
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
                                <Input type="date" input_size="sm" placeholder="Gültig bis..." value={field.state.value ? new Date(field.state.value).toISOString().split('T')[0] : ''} onChange={(e) => field.handleChange(e.target.value ? new Date(e.target.value) : null)} />
                            </div>
                        )} />

                        {/* Ihre Anfrage vom */}
                        <offerForm.Field name="requestFrom" children={(field) => (
                            <div className="flex-1 grid gap-2">
                                <label className="text-sm text-gray-500" htmlFor="">Ihre Anfrage vom:</label>
                                <Input type="date" input_size="sm" placeholder="Ihre Anfrage vom..." value={field.state.value ? new Date(field.state.value).toISOString().split('T')[0] : ''} onChange={(e) => field.handleChange(e.target.value ? new Date(e.target.value) : null)} />
                            </div>
                        )} />
                    </div>

                    <hr className="text-gray-200" />

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between w-full">
                            <Checkbox label="Vergleichen?" />
                            <Button onClick={() => setShowProductForm(true)} variant="link"
                                icon={<Plus className="size-4" />} size="sm" disabled={showProductForm}>
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
                                    <div key={index} className="flex items-center justify-between bg-gray-50 border border-(--border) rounded-md px-3 py-2">
                                        <span className="text-sm text-gray-700">
                                            {product?.name} · {op.duration_months} · Menge: {op.quantity}
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

                    <div className="grid gap-2">
                        <div className="flex items-center justify-between w-full">
                            <span className="text-sm font-medium text-gray-700">Pauschalen</span>
                            <Button onClick={() => setShowFlatRateForm(true)} variant="link"
                                icon={<Plus className="size-4" />} size="sm" disabled={showFlatRateForm}>
                                Pauschale hinzufügen
                            </Button>
                        </div>

                        <div className="flex flex-col gap-2">
                            {offerFlatRates.map((fr, index) => (
                                <div key={index} className="flex items-center justify-between bg-gray-50 border border-(--border) rounded-md px-3 py-2">
                                    <p className="text-sm">{fr.name}</p>
                                    <p className="text-sm">{fr.quantity}x</p>
                                </div>
                            ))}

                            {showFlatRateForm && (
                                <OfferFlatRateForm
                                    flatRates={flatRates}
                                    saveFn={(data) => {

                                        setOfferFlatRates((prev) => [...prev, data]);
                                        setShowFlatRateForm(false);
                                    }}
                                    cancelFn={() => setShowFlatRateForm(false)}
                                />
                            )}
                        </div>
                    </div>

                    <hr className="text-gray-200" />

                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button onClick={cancelFn} type='button' size='sm' variant='secondary'>Abbrechen</Button>
                <offerForm.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                    <Button form="offer-form" disabled={!canSubmit} type='submit' size='sm'>
                        {isSubmitting ? <Loader className="size-4 animate-spin" /> : 'Speichern'}
                    </Button>
                )} />
            </ModalDialog.Footer>
        </ModalDialog>
    )
}