import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";

import { tv } from "tailwind-variants";
import { Input } from "@/components";

interface SelectableElement {
    id: string;
    child: ReactNode;
    isSelected: boolean;
}

interface SelectProps {
    elements: SelectableElement[],
    onChange: (selected: SelectableElement) => void;
}

export default function Select({ elements, onChange }: SelectProps) {
    const [selected, setSelected] = useState<SelectableElement | null>(
        elements?.filter(element => element.isSelected)[0] || null
    );
    const [isOpen, setOpen] = useState<boolean>(false);

    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="w-full relative" ref={menuRef}>
            <div onClick={() => setOpen(!isOpen)} className="w-full cursor-pointer border py-2 px-3 rounded-lg border-(--border) flex items-center justify-between gap-4">
                <div className="grid gap-0">
                    {selected && (<>{selected?.child}</>)}
                    {!selected && (
                        <p>None</p>
                    )}
                </div>

                <ChevronDown className="size-4" />
            </div>

            {
                isOpen && (
                    <div className="shadow w-full absolute top-full left-0 bg-white border border-(--border) rounded-md mt-2">
                        {/* Searbar */}
                        <div className="border-b border-(--border) p-2">
                            <Input input_size="sm" placeholder="Search..." />
                        </div>

                        {/* Elements */}
                        <div className="grid gap-1 py-2 px-2 max-h-125 overflow-y-scroll">
                            <div className="grid gap-0">
                                {elements?.map((element: SelectableElement) => {
                                    let classNames = tv({
                                        base: [
                                            "px-2 py-2 rounded-md cursor-pointer",
                                            "hover:bg-(--primary)"
                                        ],
                                        variants: {
                                            active: {
                                                true: 'bg-gray-100',
                                                false: '',
                                            }
                                        }
                                    })

                                    return (
                                        <div key={element.id} onClick={() => {
                                            onChange(element);
                                            setSelected(element)
                                            setOpen(false)
                                        }} className={classNames({ active: element.id === selected?.id })}>
                                            {element.child}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    )
}