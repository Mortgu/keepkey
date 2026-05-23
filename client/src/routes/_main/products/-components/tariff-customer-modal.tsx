import { Badge, Button, Input, ModalDialog, Select } from "@/components";
import { useCustomerHook, useTariffHook } from "@/hooks";
import { useState, type SyntheticEvent } from "react";

interface TariffCustomerModalProps {
    onClose: () => void;
    tariffId: string;
    productOptions: { id: string; name: string }[];
    contractId: string;
    contractName: string;
    duration: number;
    min_quantity: number;
    max_quantity: number | null;
    listPrice: number;
}

export default function TariffCustomerModal({
    onClose,
    tariffId,
    productOptions,
    contractId,
    contractName,
    duration,
    min_quantity,
    max_quantity,
    listPrice,
}: TariffCustomerModalProps) {
    const { customers } = useCustomerHook();
    const { addCustomerOverride, isAddingCustomerOverride } = useTariffHook();

    const [customerId, setCustomerId] = useState<string>("");
    const [productId, setProductId] = useState<string>(productOptions[0]?.id ?? "");
    const [price, setPrice] = useState<number>(listPrice);
    const [overrideMin, setOverrideMin] = useState<number>(min_quantity);
    const [overrideMax, setOverrideMax] = useState<number | null>(max_quantity);
    const [overrideDuration, setOverrideDuration] = useState<number>(duration);

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!customerId || !productId) return;
        await addCustomerOverride({
            tariffId,
            body: {
                customerId,
                productId,
                contractId,
                duration: overrideDuration,
                min_quantity: overrideMin,
                max_quantity: overrideMax ?? undefined,
                price,
            },
        });
        onClose();
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">Kunden-Override anlegen</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id="tariff-customer-form" onSubmit={handleSubmit} className="grid gap-3">
                    <p className="text-sm text-gray-500">
                        Basis-Konfiguration: <Badge variant="generated">{contractName}</Badge>{" "}
                        {min_quantity}–{max_quantity ?? "∞"}, {duration} Monate, Listenpreis{" "}
                        {listPrice}ct.
                    </p>
                    <label className="grid gap-1 text-sm">
                        Kunde
                        <select value={customerId} onChange={(e) => setCustomerId(e.target.value)}
                            className="h-8.5 px-2 border border-(--border) rounded-md text-sm bg-white">
                            <option value="">— wählen —</option>
                            {customers.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.companyName}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label className="grid gap-1 text-sm">
                        Produkt
                        <Select value={productId} onChange={(e) => setProductId(e.target.value)}>
                            {productOptions.map((p) => (
                                <option key={p.id} value={p.id}>
                                    {p.name}
                                </option>
                            ))}
                        </Select>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        <Input label="Min" type="number" value={overrideMin}
                            onChange={(e) => setOverrideMin(parseInt(e.target.value) || 0)} />
                        <Input label="Max" type="number" value={overrideMax ?? ""}
                            onChange={(e) => setOverrideMax(e.target.value ? parseInt(e.target.value) : null)} />
                        <Input label="Laufzeit" type="number" value={overrideDuration}
                            onChange={(e) => setOverrideDuration(parseInt(e.target.value) || 0)} />
                        <Input label="Preis (Cent)" type="number" value={price}
                            onChange={(e) => setPrice(parseInt(e.target.value) || 0)} />
                    </div>
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button onClick={onClose} type="button" size="sm" variant="secondary">
                    Abbrechen
                </Button>
                <Button form="tariff-customer-form" type="submit" size="sm"
                    disabled={!customerId || !productId || isAddingCustomerOverride}
                    loading={isAddingCustomerOverride}>
                    Speichern
                </Button>
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
