import Button from "@/components/button/button";
import type { BaseFlatRate, FlatRate } from "@/data/types";
import { useFlatRates } from "@/hooks/flatrate";
import { Pen, Trash } from "lucide-react";
import { useState } from "react";
import FlatRateModal from "./flatrate-modal";

export default function FlatRateItem(item: FlatRate) {
    const { updateFlatRate, deleteFlatRate, isDeletingFlatRate } = useFlatRates();
    const [isEditing, setEditing] = useState(false);

    return (
        <>
            <div className="bg-white border border-(--border) rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3">
                    <div>
                        <p className="text-md text-gray-900">{item.name}</p>
                        <p className="text-sm font-light text-gray-400 mt-0.5">{item.table}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-6 text-sm text-gray-500 mr-2">
                            <span>Gesamt: <span className="text-gray-900 font-medium">{(item.total_cents / 100).toFixed(2)} €</span></span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" icon={<Pen className="size-3.5" />} iconOnly onClick={() => setEditing(true)} />
                            <Button variant="ghost" size="sm" loading={isDeletingFlatRate} icon={<Trash className="size-3.5" />} iconOnly onClick={() => deleteFlatRate(item.id)} />
                        </div>
                    </div>
                </div>
            </div>

            <FlatRateModal
                open={isEditing}
                cancelFn={() => setEditing(false)}
                submitFn={(value: BaseFlatRate) => updateFlatRate({ id: item.id, flatrate: value })}
                currentItem={{ name: item.name, table: item.table, quantity: item.quantity, total_cents: item.total_cents }}
            />
        </>
    );
}
