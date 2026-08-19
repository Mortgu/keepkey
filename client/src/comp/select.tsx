'use client';
import * as React from 'react';
import { Select } from '@base-ui/react/select';
import { buttonStyles } from '@/components';

const languages = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    csharp: 'C#',
    php: 'PHP',
    cpp: 'C++',
    rust: 'Rust',
    go: 'Go',
    swift: 'Swift',
};

type Language = keyof typeof languages;

const values = Object.keys(languages) as Language[];

function renderValue(value: Language[]) {
    if (value.length === 0) {
        return 'Select languages';
    }

    const firstLanguage = languages[value[0]];
    const additionalLanguages = value.length > 1 ? ` (+${value.length - 1} more)` : '';
    return firstLanguage + additionalLanguages;
}

export default function MultiSelectExample() {
    return (
        <div className="flex flex-col items-start gap-1">
            <Select.Root multiple defaultValue={['javascript', 'typescript']}>
                <Select.Label className="cursor-default text-sm font-bold text-neutral-950 dark:text-white">
                    Languages
                </Select.Label>
                <Select.Trigger className={buttonStyles({ variant: "border", size: 'sm' })}>
                    <Select.Value className="data-placeholder:text-neutral-500 dark:data-placeholder:text-neutral-400 data-placeholder:font-normal">
                        {renderValue}
                    </Select.Value>
                    <Select.Icon>
                        <CaretUpDownIcon />
                    </Select.Icon>
                </Select.Trigger>
                <Select.Portal>
                    <Select.Positioner className="outline-hidden z-10" sideOffset={4} alignItemWithTrigger={false}>
                        <Select.Popup className="rounded-md group max-h-[var(--available-height)] min-w-[var(--anchor-width)] origin-[var(--transform-origin)] bg-clip-padding overflow-y-auto border border-(--border) bg-white py-1 text-neutral-950 outline-hidden transition-[scale,opacity] duration-100 ease-out data-ending-style:scale-[0.98] data-ending-style:opacity-0 data-[side=none]:min-w-[calc(var(--anchor-width)+1.75rem)] data-[side=none]:data-ending-style:transition-none data-starting-style:scale-[0.98] data-starting-style:opacity-0 data-[side=none]:data-starting-style:scale-100 data-[side=none]:data-starting-style:opacity-100 data-[side=none]:data-starting-style:transition-none">
                            {values.map((value) => (
                                <Select.Item
                                    key={value}
                                    value={value}
                                    className="grid cursor-default grid-cols-[1rem_1fr] items-center gap-2 py-1.5 pr-2.5 pl-2.5 text-sm outline-hidden select-none scroll-my-1 [@media(hover:hover)]:data-highlighted:bg-neutral-950 [@media(hover:hover)]:data-highlighted:text-white"
                                >
                                    <Select.ItemIndicator className="col-start-1">
                                        <CheckIcon />
                                    </Select.ItemIndicator>
                                    <Select.ItemText className="col-start-2">{languages[value]}</Select.ItemText>
                                </Select.Item>
                            ))}
                        </Select.Popup>
                    </Select.Positioner>
                </Select.Portal>
            </Select.Root>
        </div>
    );
}

function CaretUpDownIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            {...props}
            style={{ display: 'block', ...props.style }}
        >
            <path d="M11 10H5l3 3.5zm0-4H5l3-3.5z" />
        </svg>
    );
}

function CheckIcon(props: React.ComponentProps<'svg'>) {
    return (
        <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            {...props}
            style={{ display: 'block', ...props.style }}
        >
            <path d="m2.5 8.5 4 4 7-9" />
        </svg>
    );
}
