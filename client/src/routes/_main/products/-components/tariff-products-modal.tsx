import { Button, ModalDialog } from "@/components";
import { MultiDropdown } from "@/components/filters/multi-dropdown";
import { useProductHook, useTariffHook } from "@/hooks";
import type { Tariff } from "@/types";
import { useMemo, useState, type SyntheticEvent } from "react";

interface TariffProductsModalProps {
    onClose: () => void;
    tariff: Tariff;
}

export default function TariffProductsModal({ onClose, tariff }: TariffProductsModalProps) {
    const { products } = useProductHook();
    const { updateTariff, isUpdating } = useTariffHook();

    const [productIds, setProductIds] = useState<string[]>(
        tariff.products.map((p) => p.id),
    );

    const productOptions = useMemo(
        () => products
            .filter((p) => !p.tariffId || p.tariffId === tariff.id)
            .map((p) => ({ value: p.id, label: p.name })),
        [products, tariff.id],
    );

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (productIds.length === 0) return;
        await updateTariff({ id: tariff.id, body: { productIds } });
        onClose();
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">Produkte der Preistabelle</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id="tariff-products-form" onSubmit={handleSubmit} className="grid gap-2">
                    <p className="text-sm text-gray-500">
                        Produkte hinzufügen oder entfernen. Konfigurationen gelten danach
                        für alle ausgewählten Produkte.
                    </p>
                    <MultiDropdown
                        label="Produkte"
                        options={productOptions}
                        values={productIds}
                        onChange={setProductIds}
                    />
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button onClick={onClose} type="button" size="sm" variant="secondary">
                    Abbrechen
                </Button>
                <Button form="tariff-products-form" type="submit" size="sm"
                    disabled={productIds.length === 0 || isUpdating} loading={isUpdating}>
                    Speichern
                </Button>
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
