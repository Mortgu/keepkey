import { ACTION_FOCUS } from "@/components";
import { Accordion as BaseAccordion } from "@base-ui/react";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import { tv } from "tailwind-variants";

const accordionStyles = tv({
    slots: {
        Root: "grid",
        Item: "border-b border-(--border) last:border-0",
        Trigger: [
            "group w-full flex items-center justify-between gap-2 px-4 py-2",
            "cursor-pointer text-left text-sm bg-(--page-bg) text-(--text)",
            ACTION_FOCUS,
        ],
        Icon: [
            "size-4 shrink-0 text-(--text-secondary)",
            "group-data-panel-open:rotate-180",
        ],
        Panel: [
            "overflow-hidden h-(--accordion-panel-height)",
        ],
        Content: "px-4",
    },
});

export interface AccordionComponentProps {
    children: ReactNode;
    defaultValue?: Array<string>;
    /** Kontrollierter Modus: geöffnete Abschnitte, zusammen mit `onValueChange`. */
    value?: Array<string>;
    onValueChange?: (value: Array<string>) => void;
    multiple?: boolean;
    className?: string;
}

export function Accordion({
    children,
    defaultValue,
    value,
    onValueChange,
    multiple = true,
    className,
}: AccordionComponentProps) {
    const styles = accordionStyles();

    return (
        <BaseAccordion.Root
            multiple={multiple}
            defaultValue={defaultValue}
            value={value}
            onValueChange={onValueChange}
            className={styles.Root({ className })}
        >
            {children}
        </BaseAccordion.Root>
    );
}

export interface AccordionSectionComponentProps {
    /** Identifiziert den Abschnitt für `defaultValue`. */
    value: string;
    label: ReactNode;
    children: ReactNode;
    /** Optionaler Inhalt links neben dem Chevron, z. B. eine Anzahl. */
    actions?: ReactNode;
    /** Bedienelement rechts neben dem Auslöser — liegt außerhalb des Buttons, darf also selbst klickbar sein. */
    aside?: ReactNode;
    className?: string;
}

export function AccordionSection({
    value,
    label,
    children,
    actions,
    aside,
    className,
}: AccordionSectionComponentProps) {
    const styles = accordionStyles();

    return (
        <BaseAccordion.Item value={value} className={styles.Item()}>
            <BaseAccordion.Header className="flex">
                <BaseAccordion.Trigger className={styles.Trigger({ className: "flex-1 min-w-0" })}>
                    <span>{label}</span>
                    <span className="flex items-center gap-2">
                        {actions}
                        <ChevronDown className={styles.Icon()} />
                    </span>
                </BaseAccordion.Trigger>
                {aside}
            </BaseAccordion.Header>

            <BaseAccordion.Panel className={styles.Panel()}>
                <div className={styles.Content({ className })}>{children}</div>
            </BaseAccordion.Panel>
        </BaseAccordion.Item>
    );
}

Accordion.Section = AccordionSection;
