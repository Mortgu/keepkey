import { useState } from "react";

import type { FlatRate, GetOfferFlatrate } from "@/types";
import { Button, Input, Select } from "@/components";
import { useLocale } from "@/hooks";
import { localized } from "@/lib/i18n-content";

interface Props {
  flatRates: Array<FlatRate>;
  saveFn: (flatRate: GetOfferFlatrate) => void;
  cancelFn: () => void;
}

export default function OfferFlatRateForm({ flatRates, saveFn, cancelFn }: Props) {
  const locale = useLocale();

  const [flatRateId, setFlatRateId] = useState<string>(flatRates[0]?.id ?? "");
  const [quantity, setQuantity] = useState<number>(1);

  const selected = flatRates.find((fr) => fr.id === flatRateId) ?? flatRates[0];

  const handleSave = () => {
    if (!selected) return;

    saveFn({
      flatRateId: selected.id,
      quantity,
      flatRate: selected,
      offerId: "",
      total_cents: 0
    });
  };

  return (
    <div className="bg-(--subtle-50) w-full grid gap-3 border border-(--border) p-2 rounded-md">
      <div className="flex items-end gap-3">
        <div className="flex-3 grid gap-1">
          <Select
            label="Pauschale"
            value={flatRateId}
            onChange={(e) => setFlatRateId(e.target.value)}
            className="bg-white"
          >
            {flatRates.map((fr) => (
              <option key={fr.id} value={fr.id}>
                {localized(fr.translations, locale, "name")}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1 grid gap-1">
          <Input
            label="Anzahl"
            type="number"
            className="bg-white"
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={cancelFn}>
            Abbrechen
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={!selected}>
            Hinzufügen
          </Button>
        </div>
      </div>
    </div>
  );
}
