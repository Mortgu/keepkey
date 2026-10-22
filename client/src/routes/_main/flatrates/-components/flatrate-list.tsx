import FlatRateItem from "./flatrate-item";
import type { Flatrate } from "@keepit/schemas";
import type { FlatrateFilters } from "../-hooks/use-flatrate-filters";
import { RouteError, Spinner } from "@/components";
import { useFlatRates } from "@/hooks";

interface Props {
  filters: FlatrateFilters;
  onEdit: (flatrate: Flatrate) => void;
}

export default function FlatRateList({ filters, onEdit }: Props) {
  const { flatRates, isPending, error } = useFlatRates(filters.params);

  return (
    <div className="grid gap-4">
      {isPending && (
        <div className="w-full flex items-center justify-center py-8">
          <Spinner />
        </div>
      )}

      {error && <RouteError error={error} />}

      {flatRates.map((flatrate) => (
        <FlatRateItem key={flatrate.id} flatrate={flatrate} onEdit={onEdit} />
      ))}
    </div>
  );
}
