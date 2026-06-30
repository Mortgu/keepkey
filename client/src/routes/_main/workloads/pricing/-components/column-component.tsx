import { Input, Button } from "@/components";
import { useTariffGroupHook } from "@/hooks";
import { Trash } from "lucide-react";
import { useState, type ChangeEvent } from "react";

interface Props {
    groupId: string;
    tariffId: string;
    columnId: string;
    duration: number;
}

export default function TariffColumnComponent({ groupId, tariffId, columnId, duration }: Props) {
    const { deleteColumn, updateColumn } = useTariffGroupHook();
    const [edit, setEdit] = useState(false);
    const [value, setValue] = useState(duration);

    const handleBlur = async () => {
        setEdit(false);
        await updateColumn({ groupId, tariffId, columnId, duration: value });
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const v = Number(e.target.value);
        if (isNaN(v)) return;
        setValue(v);
    };

    return (
        <th className="border-r border-(--border)">
            <div className="flex items-center justify-between relative text-center rounded-md px-3 py-1">
                <div onClick={() => setEdit(true)}>{value} Monate</div>
                {edit && (
                    <div className="absolute top-0 left-0 w-full">
                        <Input autoFocus size="xs" onBlur={handleBlur} value={value} onChange={handleChange} />
                    </div>
                )}
                <Button icon={<Trash className="size-3.5" />} iconOnly variant="link" size="xs"
                    onClick={() => deleteColumn({ groupId, tariffId, columnId })} />
            </div>
        </th>
    );
}