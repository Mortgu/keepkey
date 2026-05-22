import { Button, Input, ModalDialog, Select } from "@/components";
import { MultiDropdown } from "@/components/filters/multi-dropdown";
import { useContractHook, useProductHook, useTariffHook } from "@/hooks";
import { Plus, Trash } from "lucide-react";
import { useMemo, useState, type SyntheticEvent } from "react";

interface PricingModalProps {
    open: boolean;
    cancelFn: () => void;
}

interface ConfigRow {
    contractId: string;
    duration: number;
    min_quantity: number;
    max_quantity: number | null;
    price: number;
}

const emptyRow = (contractId: string): ConfigRow => ({
    contractId,
    duration: 12,
    min_quantity: 1,
    max_quantity: null,
    price: 0,
});

export default function PricingModal({ open, cancelFn }: PricingModalProps) {
    const { products } = useProductHook();
    const { contracts } = useContractHook();
    const { createTariff, addConfig, isCreating } = useTariffHook();

    const [productIds, setProductIds] = useState<string[]>([]);
    const [rows, setRows] = useState<ConfigRow[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const productOptions = useMemo(
        () => products.map((p) => ({ value: p.id, label: p.name })),
        [products],
    );

    const reset = () => {
        setProductIds([]);
        setRows([]);
        setSubmitting(false);
    };

    const addRow = () =>
        setRows((rs) => [...rs, emptyRow(contracts[0]?.id ?? "")]);

    const updateRow = (index: number, patch: Partial<ConfigRow>) =>
        setRows((rs) => rs.map((r, i) => (i === index ? { ...r, ...patch } : r)));

    const removeRow = (index: number) =>
        setRows((rs) => rs.filter((_, i) => i !== index));

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (productIds.length === 0 || rows.length === 0) return;

        setSubmitting(true);
        try {
            const tariff = await createTariff({ productIds });
            for (const row of rows) {
                await addConfig({
                    tariffId: tariff.id,
                    body: {
                        contractId: row.contractId,
                        duration: row.duration,
                        min_quantity: row.min_quantity,
                        max_quantity: row.max_quantity ?? undefined,
                        price: row.price,
                    },
                });
            }
            reset();
            cancelFn();
        } finally {
            setSubmitting(false);
        }
    };

    const canSubmit = productIds.length > 0 && rows.length > 0 && !submitting && !isCreating;

    return (
        <ModalDialog open={open} cancelFn={cancelFn}>
            <ModalDialog.Header>
                <h1 className="text-lg">Preistabelle hinzufügen</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id="pricing-form" onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-1">
                        <span className="text-caption text-gray-500">
                            Produkte (alle Konfigurationen gelten für diese Produkte)
                        </span>
                        <MultiDropdown
                            label="Produkte"
                            options={productOptions}
                            values={productIds}
                            onChange={setProductIds}
                        />
                    </div>

                    <div className="grid gap-2">
                        <span className="text-caption text-gray-500">Konfigurationen</span>
                        {rows.length === 0 && (
                            <p className="text-sm text-gray-400">
                                Noch keine Konfigurationen. Vertrag, Menge, Laufzeit und Preis (in
                                Cent) festlegen.
                            </p>
                        )}
                        {rows.map((row, i) => (
                            <div key={i} className="flex gap-2 items-center">
                                <Select value={row.contractId} onChange={(e) => updateRow(i, { contractId: e.target.value })}>
                                    {contracts.map((c) => (
                                        <option key={c.id} value={c.id}>
                                            {c.name}
                                        </option>
                                    ))}
                                </Select>
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    value={row.min_quantity}
                                    onChange={(e) =>
                                        updateRow(i, {
                                            min_quantity: parseInt(e.target.value) || 0,
                                        })
                                    }

                                />
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    value={row.max_quantity ?? ""}
                                    onChange={(e) =>
                                        updateRow(i, {
                                            max_quantity: e.target.value
                                                ? parseInt(e.target.value)
                                                : null,
                                        })
                                    }
                                />
                                <Input
                                    type="number"
                                    placeholder="Laufzeit"
                                    value={row.duration}
                                    onChange={(e) =>
                                        updateRow(i, { duration: parseInt(e.target.value) || 0 })
                                    }
                                />
                                <Input
                                    type="number"
                                    placeholder="Preis (Cent)"
                                    value={row.price}
                                    onChange={(e) =>
                                        updateRow(i, { price: parseInt(e.target.value) || 0 })
                                    }
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    icon={<Trash className="size-3.5" />}
                                    iconOnly
                                    size="sm"
                                    onClick={() => removeRow(i)}
                                />
                            </div>
                        ))}
                        <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={addRow}
                            icon={<Plus className="size-3.5" />}
                            disabled={contracts.length === 0}
                        >
                            Konfiguration hinzufügen
                        </Button>
                    </div>
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button type="button" size="sm" variant="secondary" onClick={() => {
                    reset();
                    cancelFn();
                }}>Abbrechen</Button>

                <Button form="pricing-form" type="submit" size="sm"
                    disabled={!canSubmit} loading={submitting || isCreating}>
                    Speichern
                </Button>
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
