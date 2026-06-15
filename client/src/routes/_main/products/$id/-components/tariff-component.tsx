import { ChevronRight, Plus, UndoDot } from "lucide-react";
import type { Tariff } from "@/types";
import { localized } from "@/lib/i18n-content.ts";
import { useLocale } from "@/hooks";
import { Button } from "@/components";
import TariffRowComponent from "@/routes/_main/products/$id/-components/tariff-row-component.tsx";
import TariffTermsComponent from "@/routes/_main/products/$id/-components/tariff-terms-component.tsx";
import type { PricingMode } from "../-page";

type AddTermVars = { tariffId: string; duration: number };
type RemoveTermVars = { tariffId: string; termIndex: number };
type UpdateTermVars = { tariffId: string; termIndex: number; duration: number };

type AddBandVars = {
  tariffId: string;
  min_quantity: number;
  max_quantity: number;
  prices: Array<number>;
};
type RemoveBandVars = string;
type UpdateCellVars = { cellId: string; price: number };

type Props = {
  tariff: Tariff;
  mode: PricingMode;
  selectedCustomer: string;
  onAddTerm: (vars: AddTermVars) => void;
  onRemoveTerm: (vars: RemoveTermVars) => void;
  onUpdateTerm: (vars: UpdateTermVars) => void;
  onAddBand: (vars: AddBandVars) => void;
  onRemoveBand: (vars: RemoveBandVars) => void;
  onUpdateCell: (vars: UpdateCellVars) => void;
};

export default function TariffComponent(props: Props) {
  const {
    tariff,
    mode,
    selectedCustomer,
    onAddTerm,
    onRemoveTerm,
    onUpdateTerm,

    onAddBand,
    onRemoveBand,
    onUpdateCell,
  } = props;

  const locale = useLocale();

  const addTerm = (duration: number) => {
    onAddTerm({
      tariffId: tariff.id,
      duration: tariff.terms.reduce((partialSum, a) => partialSum + a, 1),
    });
  };

  const removeTerm = (termIndex: number) => {
    onRemoveTerm({ tariffId: tariff.id, termIndex });
  };

  const updateTerm = (termIndex: number, duration: number) => {
    onUpdateTerm({ tariffId: tariff.id, termIndex, duration });
  };

  const addBand = () => {
    const lastRow = tariff.rows[tariff.rows.length - 1];
    const minQty = lastRow ? lastRow.max_quantity + 1 : 1;
    const maxQty = minQty + 99;

    onAddBand({
      tariffId: tariff.id,
      min_quantity: minQty,
      max_quantity: maxQty,
      prices: tariff.terms.map(() => 0),
    });
  };

  return (
    <div className="grid bg-white border border-(--border) rounded-md shadow-xs">
      <div className="flex items-center justify-between border-b border-(--border)">
        <div className="w-full flex items-center gap-2 py-4 px-5 hover:bg-(--page-bg) hover:cursor-pointer border-r border-(--border)">
          <ChevronRight className="size-4" />
          <h1>{localized(tariff.contract.translations, locale, "name")}</h1>
        </div>

        <div className="flex items-center gap-2 px-2">
          <Button
            icon={<UndoDot className="size-4" />}
            iconOnly
            variant="secondary"
            size="sm"
          />
          <Button variant="secondary" size="sm">
            Neu
          </Button>
        </div>
      </div>

      <div className="w-full grid gap-2 p-4">
        <div className="w-full flex gap-2 overflow-x-scroll">
          <div className="grid gap-2">
            <div className="flex gap-2">
              <p className="flex-1 min-w-50"></p>
              {tariff.terms.map((term: number, index: number) => (
                <TariffTermsComponent
                  key={index}
                  term={term}
                  index={index}
                  removeTerm={removeTerm}
                  updateTerm={updateTerm}
                />
              ))}
            </div>

            {tariff.rows.map((row) => (
              <TariffRowComponent
                key={row.id}
                row={row}
                mode={mode}
                cells={row.cells}
                onRemove={() => onRemoveBand(row.id)}
                onUpdateCell={(cellId, price) =>
                  onUpdateCell({ cellId, price })
                }
              />
            ))}
          </div>

          <Button
            className="h-full border-dashed"
            icon={<Plus className="size-4" />}
            size="sm"
            variant="secondary"
            onClick={() => addTerm(12)}
          />
        </div>

        <Button
          variant="secondary"
          className="w-full border-dashed"
          onClick={addBand}
        >
          Zeile hinzufügen
        </Button>
      </div>
    </div>
  );
}
