import {Button, Input} from "@/components";
import {X} from "lucide-react";
import {useState} from "react";

type Props = {
    term: number;
    index: number;
    removeTerm: (index: number) => void;
    updateTerm: (index: number, duration: number) => void;
}

export default function TariffTermsComponent({term, index, removeTerm, updateTerm}: Props) {
    const [edit, setEdit] = useState<boolean>(false);
    const [duration, setDuration] = useState<number>(term);

    return (
        <div key={index} className="flex-1 flex items-center justify-between gap-2 min-w-50">
            {!edit && (
                <div className="flex items-center justify-start w-full h-full text-left" onClick={() => setEdit(true)}>
                    <p className="text-center">{duration} Monate</p>
                </div>
            )}

            {edit && (
                <Input autoFocus size="xs" onBlur={() => setEdit(false)} value={duration}
                       onChange={(e) => {
                           const value: number = Number(e.target.value);

                           if (isNaN(value)) {
                               return;
                           }

                           setDuration(value);
                           updateTerm(index, value);
                       }}/>
            )}

            <Button size="xs" variant="secondary" icon={<X className="size-3.5"/>} iconOnly
                    onClick={() => removeTerm(index)}/>
        </div>
    )
}