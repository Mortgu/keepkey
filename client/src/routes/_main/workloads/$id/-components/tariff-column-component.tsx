import { useState } from "react";
import { Trash } from "lucide-react";
import type { ChangeEvent } from "react";
import type { TariffColumn } from "@/types";
import { Button, Input } from "@/components";
import { useTariffHook } from "@/hooks";
import TariffCellComponent from "@/routes/_main/workloads/$id/-components/tariff-cell-component.tsx";

type Props = {
    tariffId: string;
    column: TariffColumn;
}

export default function TariffColumnComponent({ tariffId, column }: Props) {
    const [edit, setEdit] = useState<boolean>(false);
    const [duration, setDuration] = useState<number>(column.duration);

    const { deleteColumn, updateColumn } = useTariffHook();

    const handleBlur = async () => {
        setEdit(false);

        await updateColumn({
            tariffId: tariffId,
            columnId: column.id,
            duration: duration,
        });
    }

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const value = Number(event.target.value);

        if (isNaN(value)) return;

        setDuration(value);
    }

    return (
        <div className="flex-1 grid gap-2">
            <div className="flex items-center justify-between relative flex-2 text-center rounded-md px-3">
                <div key={column.id} onClick={() => setEdit(true)}>{duration} Monate</div>

                {edit && (
                    <div className="absolute top-0 left-0 w-full">
                        <Input
                            autoFocus
                            size="xs"
                            onBlur={handleBlur}
                            value={duration}
                            onChange={handleChange}
                        />
                    </div>
                )}

                <Button
                    icon={<Trash className="size-3.5" />}
                    iconOnly
                    variant="link"
                    size="xs"
                    onClick={() => deleteColumn({ tariffId, columnId: column.id })}
                />
            </div>

            {column.cells.map((cell) => (
                <TariffCellComponent tariffId={tariffId} cell={cell.default_cells[0]} />
            ))}
        </div>
    )
}