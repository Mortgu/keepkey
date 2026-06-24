import { useEffect, useState } from "react";

import { Button, Checkbox, Input, Select } from "@/components";
import { useContractHook, useCustomers, useLocale, useProductHook, useSupplierHook, useTariffDurationsHook } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import type { OfferPosition } from "@/types";

export type OfferProductInput = Omit<OfferPosition,
  "id" | "createdAt" | "updatedAt" | "offer" | "product" | "contract" | "offerId"
>;

interface Props {
  onSave: (data: OfferProductInput) => void;
  onCancel: () => void;
  currentProduct?: OfferProductInput;
}

export default function OfferProductForm({ currentProduct, onSave, onCancel }: Props) {
  const { products } = useProductHook();
  const { contracts } = useContractHook();
  const { customers } = useCustomers();
  const { suppliers } = useSupplierHook();

  const locale = useLocale();

  const [productId, setProductId] = useState(currentProduct?.productId ?? products[0]?.id ?? "");
  const [contractId, setContractId] = useState(currentProduct?.contractId ?? contracts[0]?.id ?? "");

  const [duration_months, setDurationMonths] = useState<number>(currentProduct?.duration_months ?? 0);
  const [quantity, setQuantity] = useState<number>(currentProduct?.quantity ?? 1);

  const [optional, setOptional] = useState<boolean>(currentProduct?.optional ?? false);

  const [error, setError] = useState("");

  const { durations } = useTariffDurationsHook(productId, contractId);


  useEffect(() => {
    if (durations.length > 0 && !durations.includes(duration_months)) {
      setDurationMonths(durations[0]);
    }
    if (durations.length === 0) {
      setDurationMonths(0);
    }
  }, [durations]);

  useEffect(() => {
  }, [duration_months, quantity, productId, contractId]);

  const handleSave = () => {
    if (!productId) {
      setError("Bitte ein Produkt auswählen.");
      return;
    }
    if (!contractId) {
      setError("Bitte einen Vertrag auswählen.");
      return;
    }
    if (durations.length === 0) {
      setError("Kein Tariff für dieses Produkt und diesen Vertrag konfiguriert.");
      return;
    }
    if (quantity < 1) {
      setError("Menge muss mindestens 1 sein.");
      return;
    }


    onSave({ productId, contractId, duration_months, quantity, optional, total_cents: 0 });
  };

  return (
    <div className="bg-(--subtle-50) w-full grid gap-3 border border-(--border) p-2 rounded-md">
      <div className="flex items-end gap-3">
        <div className="flex-2 grid gap-1">
          <Select label="Produkt" value={productId} onChange={(e) => setProductId(e.target.value)} className="bg-white">
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {localized(p.translations, locale, "name")}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-2 grid gap-1">
          <Select label="Vertrag" value={contractId} onChange={(e) => setContractId(e.target.value)} className="bg-white">
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>
                {localized(c.translations, locale, "name")}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1 grid gap-1">
          <Select label="Laufzeit" value={duration_months} onChange={(e) =>
            setDurationMonths(Number(e.target.value))} className="bg-white" disabled={durations.length === 0}>
            {durations.length === 0 && (
              <option value={0}>Kein Tariff konfiguriert</option>
            )}
            {durations.map((d) => (
              <option key={d} value={d}>
                {d} Monate
              </option>
            ))}
          </Select>
        </div>

        <div className="w-20 grid gap-1">
          <Input label="Menge" type="number" value={quantity}
            onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
            className="bg-white" />
        </div>

        <div className="w-20 grid gap-1">
          <Input label="Preis" value={0}
            onChange={(e) => { }}
            className="bg-white" />
        </div>
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <Checkbox label="Optional?" onChange={() => setOptional(!optional)} />
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={onCancel}>
            Abbrechen
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            Hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
}
