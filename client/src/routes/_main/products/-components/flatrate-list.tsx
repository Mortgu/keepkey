import { Button } from "@/components";
import type { FlatRate } from "@/types";
import { useFlatRateHook, useModal } from "@/hooks";
import { Loader, Plus } from "lucide-react";
import FlatRateItem from "./flatrate-item";
import FlatRateModal from "./flatrate-modal";

export default function FlatRateList() {
  const modal = useModal();
  const { flatRates, isPending, error, createFlatRate } = useFlatRateHook();

  if (isPending) {
    return <Loader className="animate-spin" />;
  }

  if (error) {
    return (
      <div className="p-2 bg-red-200 border border-red-400 rounded-lg">
        <p className="text-lg">Error</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
          Flatrates
        </h1>
        <Button onClick={() => modal.open()} size="sm">
          Erstellen <Plus className="size-4" />
        </Button>
      </div>

      <div className="grid gap-2">
        {flatRates?.map((item: FlatRate) => (
          <FlatRateItem key={item.id} item={item} />
        ))}
      </div>

      {modal.isOpen && (
        <FlatRateModal key={modal.key} onClose={modal.close}
          submitFn={(value) => createFlatRate({ ...value })} />
      )}
    </div>
  );
}
