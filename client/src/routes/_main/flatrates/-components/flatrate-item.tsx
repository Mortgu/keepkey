import { Pen, Trash } from "lucide-react";
import type { Flatrate } from "@keepit/schemas";
import { Button } from "@/components";
import { useDeleteFlatRate, useLocale, useUpdateFlatRate } from "@/hooks";
import { localized } from "@/lib/i18n-content";
import { formatDate } from "@/lib/format";

interface Props {
  flatrate: Flatrate;
  onEdit: (flatrate: Flatrate) => void;
}

export default function FlatRateItem({ flatrate, onEdit }: Props) {
  const { deleteFlatRate, isDeletingFlatRate } = useDeleteFlatRate();
  const { updateFlatRate } = useUpdateFlatRate();

  const locale = useLocale();

  return (
    <div className="bg-(--page-bg) border border-(--border) rounded-md overflow-hidden">
      <div className="flex flex-wrap items-center justify-between ">
        <div className="px-4 py-3 gap-4">
          <p className="text-lg font-medium">{localized(flatrate.translations, locale, "name")}</p>
          <p className="text-sm font-light text-gray-500">
            {formatDate(flatrate.createdAt || "")}
          </p>
        </div>

        <div className="w-full px-4 py-4 gap-4 bg-white border-t border-(--border)">
          <p className="text-md font-normal text-gray-800">
            {localized(flatrate.translations, locale, "table")}
          </p>
        </div>

        <div className="flex items-center justify-between w-full px-4 py-2 gap-4 bg-white border-t border-(--border)">

          <div className="flex items-center gap-2 text-md text-gray-500 mr-2">
            <span>Gesamt: </span>
            <span className="text-gray-900 font-medium font-mono">
              {(flatrate.total_cents / 100).toFixed(2)} €
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="border"
              size="sm"
              icon={<Pen size={14} />}
              iconOnly
              onClick={() => onEdit(flatrate)} />

            <Button
              variant="border"
              size="sm"
              loading={isDeletingFlatRate}
              icon={<Trash size={14} />}
              iconOnly
              onClick={() => deleteFlatRate(flatrate.id)} />
          </div>
        </div>
      </div>
    </div>
  );
}
