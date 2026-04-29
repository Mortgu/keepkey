import Button from "@/components/button/button";
import type { FlatRate } from "@/data/types";
import { useFlatRates } from "@/hooks/flatrate";
import { Loader, Plus } from "lucide-react";
import { useState } from "react";
import FlatRateItem from "./flatrate-item";
import FlatRateModal from "./flatrate-modal";

export default function FlatRateList() {
    const [isOpen, setOpen] = useState(false);
    const { flatRates, isPending, error, createFlatRate } = useFlatRates();

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
                    Flatrates ({flatRates?.length})
                </h1>
                <Button onClick={() => setOpen(true)} size="sm">
                    Erstellen <Plus className="size-4" />
                </Button>
            </div>

            <div className="grid gap-2">
                {flatRates?.map((item: FlatRate) => (
                    <FlatRateItem key={item.id} {...item} />
                ))}
            </div>

            <FlatRateModal
                open={isOpen}
                cancelFn={() => setOpen(false)}
                submitFn={(value) => createFlatRate({ ...value })}
            />
        </div>
    );
}
