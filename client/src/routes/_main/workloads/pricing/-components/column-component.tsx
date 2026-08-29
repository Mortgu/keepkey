import { Trash } from "lucide-react";
import { useState } from "react";
import { Button, NumberField } from "@/components";
import { useDeleteTariffColumn, useUpdateTariffColumn } from "@/hooks/tariffs/tariff-mutations";

interface Props {
    groupId: string;
    tariffId: string;
    columnId: string;
    duration: number;
}

export default function TariffColumnComponent({ groupId, tariffId, columnId, duration }: Props) {
    const { deleteColumn } = useDeleteTariffColumn();
    const { updateColumn } = useUpdateTariffColumn();
    const [edit, setEdit] = useState(false);
    const [value, setValue] = useState(duration);

    // Gespeichert wird über `onValueCommitted`, nicht im Blur-Handler: base-ui
    // parst den getippten Text erst in seinem eigenen Blur-Handler, der nach dem
    // externen läuft — der externe Handler läse also noch den alten Wert.
    const handleCommit = async (committed: number | null) => {
        if (committed === null || committed === duration) return;

        setValue(committed);
        await updateColumn({ groupId, tariffId, columnId, duration: committed });
    };

    return (
        <th className="border-r border-(--border)">
            <div className="flex items-center justify-between relative text-center rounded-md px-3 py-1">
                <div onClick={() => setEdit(true)}>{value} Monate</div>
                {edit && (
                    <div className="absolute top-0 left-0 w-full">
                        <NumberField size="xs" hideSteppers autoFocus min={1} step={1}
                            value={value} onValueChange={(v) => setValue(v ?? duration)}
                            onValueCommitted={handleCommit} onBlur={() => setEdit(false)} />
                    </div>
                )}
                <Button icon={<Trash className="size-3.5" />} iconOnly variant="link" size="xs"
                    onClick={() => deleteColumn({ groupId, tariffId, columnId })} />
            </div>
        </th>
    );
}
