import { useEffect, useState } from "react";

import { Button, Checkbox, Input, Select } from "@/components";
import { useLocale, useProducts, useTariffDurationsHook } from "@/hooks";
import { useContracts } from "@/hooks/contracts/contract-hooks";
import type { TariffPriceResult } from "@/hooks/tariffs/tariff-api";
import { getTariffPrice } from "@/hooks/tariffs/tariff-api";
import { localized } from "@/lib/i18n-content";
import type { OfferPosition } from "@/types";
import { formatEur } from "@/utils/utils";
import { Pen } from "lucide-react";
import { useTranslation } from "react-i18next";

export type OfferProductInput = Omit<OfferPosition,
  "id" | "createdAt" | "updatedAt" | "offer" | "product" | "contract" | "offerId"
>;

interface Props {
  onSave: (data: OfferProductInput) => void;
  onCancel: () => void;
  currentProduct?: OfferProductInput;
  customerId?: string;
  onPersistOverride?: (
    data: OfferProductInput,
    unitPriceCents: number,
  ) => Promise<number>;
}

const eurToCents = (eur: number): number => Math.round(eur * 100);

export default function OfferProductForm({ currentProduct, customerId, onPersistOverride, onSave, onCancel }: Props) {
  const { t } = useTranslation();
  const { products } = useProducts();
  const { contracts } = useContracts();

  const locale = useLocale();

  const [productId, setProductId] = useState(currentProduct?.productId ?? products[0]?.id ?? "");
  const [contractId, setContractId] = useState(currentProduct?.contractId ?? contracts[0]?.id ?? "");

  const [duration_months, setDurationMonths] = useState<number>(currentProduct?.duration_months ?? 0);
  const [freeMonths, setFreeMonths] = useState<number>(currentProduct?.free_months ?? 0);
  const [quantity, setQuantity] = useState<number>(currentProduct?.quantity ?? 1);

  const [optional, setOptional] = useState<boolean>(currentProduct?.optional ?? false);

  const [error, setError] = useState("");

  const { durations } = useTariffDurationsHook(productId, contractId);

  const [unitPriceCents, setUnitPriceCents] = useState<number>(0);
  const [priceLoading, setPriceLoading] = useState<boolean>(false);
  const [editingPrice, setEditingPrice] = useState<boolean>(false);
  const [overrideEur, setOverrideEur] = useState<string>("");

  useEffect(() => {
    if (durations.length > 0 && !durations.includes(duration_months)) {
      setDurationMonths(durations[0]);
    }
    if (durations.length === 0) {
      setDurationMonths(0);
    }
  }, [durations]);

  useEffect(() => {
    let cancelled = false;

    if (!productId || !contractId || duration_months <= 0 || quantity < 1 || !customerId) {
      setUnitPriceCents(0);
      return;
    }

    setPriceLoading(true);
    getTariffPrice(productId, contractId, duration_months, quantity, customerId, freeMonths)
      .then((res: TariffPriceResult) => {
        if (cancelled) return;
        setUnitPriceCents(res.breakdown.unitPrice);
      })
      .catch(() => {
        if (cancelled) return;
        setUnitPriceCents(0);
      })
      .finally(() => {
        if (!cancelled) setPriceLoading(false);
      });

    return () => { cancelled = true; };
  }, [productId, contractId, duration_months, quantity, customerId, freeMonths]);

  const startEditPrice = () => {
    setOverrideEur((unitPriceCents / 100).toString());
    setEditingPrice(true);
  };

  const handleSave = async () => {
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
    if (freeMonths < 0 || freeMonths > duration_months) {
      setError("Freimonate dürfen nicht negativ sein und nicht die Laufzeit überschreiten.");
      return;
    }

    const data: OfferProductInput = { productId, contractId, duration_months, free_months: freeMonths, quantity, optional, total_cents: 0, eur_user_month: 0, discount_cents: 0 };

    try {
      if (editingPrice && onPersistOverride && customerId) {
        const parsed = Number(overrideEur.replace(",", "."));
        if (isNaN(parsed) || parsed < 0) {
          setError("Ungültiger Preis.");
          return;
        }
        const overrideCents = eurToCents(parsed);
        await onPersistOverride(data, overrideCents);
      }

      onSave(data);
    } catch (exception: unknown) {
      setError(exception instanceof Error ? exception.message : "Preis konnte nicht gespeichert werden.");
    }
  };

  const displayUnitPrice = editingPrice
    ? overrideEur
    : formatEur(unitPriceCents);

  return (
    <div className="w-full grid gap-3 py-4 px-4">
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


      </div>

      <div className="flex items-end gap-3">

        <div className="flex-2 grid gap-1">
          <Input
            label="Stückpreis / Monat (pro Seat)"
            className="bg-white"
            value={displayUnitPrice}
            disabled={!editingPrice || priceLoading}
            type={editingPrice ? "number" : "text"}
            step={editingPrice ? "0.01" : undefined}
            min={editingPrice ? "0" : undefined}
            onChange={(e) => setOverrideEur(e.target.value)}
            rightButton={onPersistOverride && customerId ? {
              icon: <Pen className="size-3" />,
              variant: "secondary",
              type: "button",
              onClick: () => editingPrice ? setEditingPrice(false) : startEditPrice(),
            } : undefined}
          />
        </div>

        <div className="flex-1 grid gap-1">
          <Input
            label="Freimonate"
            className="bg-white"
            type="number"
            value={freeMonths}
            min={0}
            max={duration_months}
            disabled={duration_months <= 0}
            onChange={(e) => setFreeMonths(Math.max(0, Number(e.target.value)))}
          />
        </div>


      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <div className="flex items-center justify-between gap-2">
        <Checkbox label="Optional?" onChange={() => setOptional(!optional)} checked={optional} />

        <div className="flex gap-2">
          <Button type="button" variant="border" size="sm" onClick={onCancel}>
            {t("button.cancel")}
          </Button>
          <Button type="button" size="sm" onClick={handleSave}>
            {t("button.save")}
          </Button>
        </div>
      </div>
    </div>
  );
}
