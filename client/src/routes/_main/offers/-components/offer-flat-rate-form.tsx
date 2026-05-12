import { useState } from "react";

import type { CreateOfferFlatRatesInput, FlatRate } from "@/types";
import { Button, Input, Select } from "@/components";

interface Props {
  flatRates: FlatRate[];
  saveFn: (flatRate: CreateOfferFlatRatesInput) => void;
  cancelFn: () => void;
}

export default function OfferFlatRateForm(props: Props) {
  const { flatRates, saveFn, cancelFn } = props;

  const [flatRateIndex, setFlatRateIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);

  const handleSave = () => {
    const flatRate: CreateOfferFlatRatesInput = {
      flatRateId: flatRates[flatRateIndex].id,
      flatRate: flatRates[flatRateIndex],
      offerId: "",
      quantity,
      ...flatRates[flatRateIndex],
    }

    saveFn(flatRate);
  };

  return (
    <div className="bg-(--subtle-50) w-full grid gap-3 border border-(--border) p-2 rounded-md">
      <div className="flex items-end gap-3">
        <div className="flex-3 grid gap-1">
          <Select label="Pauschale" value={flatRates[0].id} onChange={(e) => setFlatRateIndex(parseInt(e.target.value))} className="bg-white">
            {flatRates.map((fr, index) => (
              <option key={index} value={index}>
                {fr.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="flex-1 grid gap-1">
          <Input label="Anzahl" type="number" className="bg-white"
            value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))}
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-2">
        <div className="flex gap-2">
          <Button type="button" variant="secondary" size="sm" onClick={cancelFn}>
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
