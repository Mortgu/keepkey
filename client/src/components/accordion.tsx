import { Accordion as BaseAccordion } from "@base-ui/react";
import { ChevronDown } from "lucide-react";
import { tv } from "tailwind-variants";
import { ACTION_FOCUS } from "./tokens";
import type { ReactNode } from "react";

/**
 * Aufklappbare Abschnitte auf base-ui. Ersetzt das handgebaute `Collapsable`
 * (kein `aria-expanded`, keine Animation) und das duplizierte Root/Item/
 * Header/Trigger/Panel-Boilerplate an den Call-Sites.
 *
 * Die Styles bleiben modul-privat — react-refresh verlangt, dass ein Modul
 * ausschließlich React-Komponenten exportiert (vgl. `menu-styles.ts`).
 */
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
            "transition-transform duration-150 ease-out",
            "group-data-panel-open:rotate-180",
        ],
        /* Kein Padding hier — base-ui misst diese Box für `--accordion-panel-height`. */
        Panel: [
            "overflow-hidden h-(--accordion-panel-height)",
            "transition-[height] duration-150 ease-out",
            "data-starting-style:h-0 data-ending-style:h-0",
        ],
        Content: "px-4",
    },
});

export interface AccordionComponentProps {
    children: ReactNode;
    /** Werte der Abschnitte, die initial offen sind. */
    defaultValue?: Array<string>;
    /** Mehrere Abschnitte gleichzeitig offen. */
    multiple?: boolean;
    className?: string;
}

export function Accordion({
    children,
    defaultValue,
    multiple = true,
    className,
}: AccordionComponentProps) {
    const styles = accordionStyles();

    return (
        <BaseAccordion.Root
            multiple={multiple}
            defaultValue={defaultValue}
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
    className?: string;
}

export function AccordionSection({
    value,
    label,
    children,
    actions,
    className,
}: AccordionSectionComponentProps) {
    const styles = accordionStyles();

    return (
        <BaseAccordion.Item value={value} className={styles.Item()}>
            <BaseAccordion.Header>
                <BaseAccordion.Trigger className={styles.Trigger()}>
                    <span>{label}</span>
                    <span className="flex items-center gap-2">
                        {actions}
                        <ChevronDown className={styles.Icon()} />
                    </span>
                </BaseAccordion.Trigger>
            </BaseAccordion.Header>

            <BaseAccordion.Panel className={styles.Panel()}>
                <div className={styles.Content({ className })}>{children}</div>
            </BaseAccordion.Panel>
        </BaseAccordion.Item>
    );
}

Accordion.Section = AccordionSection;
