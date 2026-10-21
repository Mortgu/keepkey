import { useTranslation } from "react-i18next";
import FlatRateItem from "./flatrate-item";
import type { Flatrate } from "@keepit/schemas";
import type { FlatrateFilters } from "../-hooks/use-flatrate-filters";
import { Spinner } from "@/components";
import { useFlatRates } from "@/hooks";

interface Props {
  filters: FlatrateFilters;
  onEdit: (flatrate: Flatrate) => void;
}

export default function FlatRateList({ filters, onEdit }: Props) {
  const { t } = useTranslation();
  const { flatRates, isPending, error } = useFlatRates(filters.params);

  return (
    <div className="grid gap-4">
      {isPending && (
        <div className="w-full flex items-center justify-center py-8">
          <Spinner />
        </div>
      )}

      {error && (
        <div className="w-full grid items-center justify-start py-8">
          <p className="text-(--destructive) text-lg font-semibold">{t("flatrates.loadError.title")}</p>
          <p className="text-(--destructive) font-medium">{t("flatrates.loadError.message")}</p>
        </div>
      )}

      {flatRates.map((flatrate) => (
        <FlatRateItem key={flatrate.id} flatrate={flatrate} onEdit={onEdit} />
      ))}
    </div>
  );
}
