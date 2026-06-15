import { useState, type ChangeEvent } from "react";

import type { NewTariffCell } from "@/types";
import type { PricingMode } from "../-page";
import { formatEur } from "@/utils/utils.ts";
import { Input } from "@/components";

type Props = {
  cell: NewTariffCell;
  onPriceChange: (price: number) => void;
  mode: PricingMode;
  selectedCustomer: string;
};

export default function TariffCellComponent({
  cell,
  onPriceChange,
  mode,
  selectedCustomer,
}: Props) {
  const [edit, setEdit] = useState<boolean>(false);
  const [price, setPrice] = useState<number>(cell.price);

  const handleBlur = () => {
    setEdit(false);

    if (price !== cell.price) {
      onPriceChange(price);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);

    if (isNaN(value)) return;

    setPrice(value);
  };

  const customer = cell.customerPrices.find(
    (c) => c.customerId === selectedCustomer,
  );

  return (
    <div
      onClick={() => setEdit(true)}
      className="flex-1 border border-(--border) rounded-md hover:bg-(--page-bg) min-w-50"
    >
      {edit ? (
        <div className="w-full h-full py-2 px-3 flex items-center justify-center">
          <Input
            autoFocus
            size="xs"
            onBlur={handleBlur}
            value={price}
            onChange={handleChange}
          />
        </div>
      ) : (
        <div className="text-right py-2 px-3 pointer-events-none">
          {mode === "customer" && customer ? (
            <p>{formatEur(customer.price)}</p>
          ) : (
            <p>{formatEur(cell.price)}</p>
          )}
          <p className="text-sm text-(--text-secondary)">/Nutzer</p>
        </div>
      )}
    </div>
  );
}
