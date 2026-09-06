
import { LoaderCircle } from "lucide-react";
import FlatRateItem from "./flatrate-item";
import type { Flatrate } from "@keepit/schemas";
import type { FlatrateFilters } from "../-hooks/use-flatrate-filters";
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
          <LoaderCircle className="animate-spin" />
        </div>
      )}

      {error && (
        <div className="w-full grid items-center justify-start py-8">
          <p className="text-(--destructive) text-lg font-semibold">Error</p>
          <p className="text-(--destructive) font-medium">Something went wrong trying to fetch flatrates!</p>
        </div>
      )}

      {flatRates.map((flatrate) => (
        <FlatRateItem key={flatrate.id} flatrate={flatrate} onEdit={onEdit} />
      ))}
    </div>
  );
}
