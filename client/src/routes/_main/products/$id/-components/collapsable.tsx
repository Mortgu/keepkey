import {useState} from "react";
import type {Contract} from "@/types";
import {ChevronDown} from "lucide-react";
import {localized} from "@/lib/i18n-content.ts";
import {useLocale} from "@/hooks";

type Props = {
    contract: Contract;
}

export default function Collapsable({contract}: Props) {
    const [open, setOpen] = useState<boolean>(false);

    const locale = useLocale();

    return (
        <div className="border border-(--border) rounded-md shadow-xs">
            <div onClick={() => setOpen(!open)}
                 className="py-3.5 px-4.5 flex items-center justify-between hover:bg-gray-100 cursor-pointer border-b border-(--border)">
                <div className="flex items-center gap-2">
                    <ChevronDown className={open ? "size-4" : "size-4 rotate--45"}/>
                    {localized(contract.translations, locale, "name")}
                </div>
            </div>

            {open && (
                <div className="py-3.5 px-4.5"></div>
            )}
        </div>
    )
}