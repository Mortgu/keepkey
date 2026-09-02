import * as React from "react";
import { tv } from "tailwind-variants";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { ACTION_FOCUS } from "./tokens";
import type { ComponentSize } from "./tokens";
import type { LinkProps } from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Ein Eintrag der Breadcrumb-Leiste.
 *
 * Ein Eintrag ist genau dann ein Link, wenn `to` (TanStack Router) oder `href`
 * (externes Ziel) gesetzt ist. Der letzte Eintrag wird immer als aktuelle Seite
 * gerendert — auch wenn er ein Ziel trägt.
 */
export interface BreadcrumbItem
    extends Partial<Pick<LinkProps, "to" | "params" | "search" | "hash">> {
    label: ReactNode;
    /** Externes Ziel. Wird nur genutzt, wenn `to` fehlt. */
    href?: string;
    icon?: ReactNode;
}

export interface BreadcrumbsProps
    extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
    items: Array<BreadcrumbItem>;
    size?: ComponentSize;
    /** Trennzeichen zwischen den Einträgen. */
    separator?: ReactNode;
    /**
     * Ab wie vielen Einträgen die Mitte zu „…“ zusammenfällt. Erster und die
     * letzten beiden Einträge bleiben immer sichtbar. `0` schaltet das ab.
     */
    maxItems?: number;
    /** Beschriftung der `<nav>`-Landmarke für Screenreader. */
    label?: string;
}

const TEXT_SIZE = {
    xs: "text-[12px]",
    sm: "text-[13px]",
    md: "text-[14px]",
} as const satisfies Record<ComponentSize, string>;

const ICON_SIZE = { xs: 12, sm: 14, md: 16 } as const satisfies Record<
    ComponentSize,
    number
>;

const listStyles = tv({
    base: "flex flex-wrap items-center gap-1.5 text-(--text-secondary)",
});

const itemStyles = tv({
    base: [
        "inline-flex items-center gap-1.5 rounded-sm",
        "max-w-[16rem] truncate transition-colors",
        ACTION_FOCUS,
    ],
    variants: {
        interactive: {
            true: "hover:text-(--text) hover:underline underline-offset-2 cursor-pointer",
            false: "",
        },
        current: {
            true: "text-(--text) font-medium",
            false: "text-(--text-secondary)",
        },
    },
    defaultVariants: { interactive: false, current: false },
});

const separatorStyles = tv({
    base: "flex shrink-0 select-none items-center text-(--text-secondary)",
});

function ItemContent({ item }: { item: BreadcrumbItem }) {
    return (
        <>
            {item.icon && <span className="flex shrink-0">{item.icon}</span>}
            <span className="truncate">{item.label}</span>
        </>
    );
}

/** Ein Eintrag: Router-Link, `<a>` oder statischer Text — je nach Ziel. */
function BreadcrumbEntry({
    item,
    current,
}: {
    item: BreadcrumbItem;
    current: boolean;
}) {
    if (current || (!item.to && !item.href)) {
        return (
            <span
                className={itemStyles({ current })}
                aria-current={current ? "page" : undefined}
            >
                <ItemContent item={item} />
            </span>
        );
    }

    if (item.to) {
        const target: LinkProps = {
            to: item.to,
            params: item.params,
            search: item.search,
            hash: item.hash,
        };
        return (
            <Link {...target} className={itemStyles({ interactive: true })}>
                <ItemContent item={item} />
            </Link>
        );
    }

    return (
        <a href={item.href} className={itemStyles({ interactive: true })}>
            <ItemContent item={item} />
        </a>
    );
}

/**
 * Breadcrumb-Navigation.
 *
 * ```tsx
 * <Breadcrumbs
 *     items={[
 *         { label: "Kunden", to: "/customers" },
 *         { label: customer.name, to: "/customers/$customerId", params: { customerId } },
 *         { label: "Dokumente" },
 *     ]}
 * />
 * ```
 */
export function Breadcrumbs({
    items,
    size = "sm",
    separator,
    maxItems = 0,
    label = "Breadcrumb",
    className,
    ...props
}: BreadcrumbsProps) {
    const [expanded, setExpanded] = React.useState(false);

    const collapsed =
        !expanded && maxItems > 0 && items.length > maxItems && items.length > 3;

    /** Bei Kollaps: erster Eintrag, Platzhalter (`null`), letzte zwei Einträge. */
    const visible: Array<BreadcrumbItem | null> = collapsed
        ? [items[0], null, ...items.slice(-2)]
        : items;

    const iconSize = ICON_SIZE[size];
    const separatorNode = separator ?? (
        "/"
    );

    if (items.length === 0) return null;

    return (
        <nav aria-label={label} className={className} {...props}>
            <ol className={`${listStyles()} ${TEXT_SIZE[size]}`}>
                {visible.map((item, index) => {
                    const isLast = index === visible.length - 1;

                    return (
                        <li
                            key={item ? `${index}-${item.to ?? item.href ?? ""}` : "ellipsis"}
                            className="flex min-w-0 items-center gap-1.5"
                        >
                            {item ? (
                                <BreadcrumbEntry item={item} current={isLast} />
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => setExpanded(true)}
                                    aria-label={`${items.length - 3} weitere Ebenen anzeigen`}
                                    className={itemStyles({ interactive: true })}
                                >
                                    <MoreHorizontal size={iconSize} aria-hidden="true" />
                                </button>
                            )}
                            {!isLast && (
                                <span className={separatorStyles()} aria-hidden="true">
                                    {separatorNode}
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
