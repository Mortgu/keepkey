
import { useFlatRates } from "@/hooks";
import FlatRateItem from "./flatrate-item";
import { LoaderCircle } from "lucide-react";
import type { Flatrate } from "@keepit/schemas";

interface Props {
  onEdit: (flatrate: Flatrate) => void;
}

export default function FlatRateList({ onEdit }: Props) {
  const { flatRates, isPending, error } = useFlatRates();

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

      {flatRates.map((flatrate, _) => (
        <FlatRateItem key={flatrate.id} flatrate={flatrate} onEdit={onEdit} />
      ))}
    </div>
  );
}
