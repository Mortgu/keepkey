import { FileText, ShoppingCart, Users } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { SearchResultItem, SearchType } from "@keepit/schemas";
import type { ReactNode } from "react";

const TYPE_ICON: Record<SearchType, ReactNode> = {
    offer: <FileText size={16} />,
    order: <ShoppingCart size={16} />,
    customer: <Users size={16} />,
};

const TYPE_COLOR: Record<SearchType, string> = {
    offer: "text-[#00683F]",
    order: "text-[#8A5FBF]",
    customer: "text-[#4B7CBF]",
};

const TYPE_LABEL_KEY: Record<SearchType, string> = {
    offer: "dashboard.search.typeLabels.offer",
    order: "dashboard.search.typeLabels.order",
    customer: "dashboard.search.typeLabels.customer",
};

/** Hebt den Suchbegriff im Treffer hervor — erster Fund, ohne Rücksicht auf Gross-/Kleinschreibung. */
function highlight(text: string, query: string): ReactNode {
    if (!query) return text;

    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
        <>
            {text.slice(0, index)}
            <mark className="bg-(--primary-100) text-(--primary-600) rounded-[2px] px-px">
                {text.slice(index, index + query.length)}
            </mark>
            {text.slice(index + query.length)}
        </>
    );
}

/**
 * „vor 3 Std." statt eines Datums, solange das aussagekräftiger ist.
 *
 * Ab einer Woche kippt es auf das Datum: „vor 34 Tagen" beantwortet keine Frage,
 * die ein Datum nicht besser beantwortet.
 */
function formatRelativeDate(iso: string, t: (key: string, opts?: Record<string, unknown>) => string): string {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return t("dashboard.search.justNow");
    if (minutes < 60) return t("dashboard.search.minutesAgo", { count: minutes });
    if (hours < 24) return t("dashboard.search.hoursAgo", { count: hours });
    if (days < 7) return t("dashboard.search.daysAgo", { count: days });

    return new Date(iso).toLocaleDateString();
}

interface Props {
    item: SearchResultItem;
    query: string;
    onSelect: () => void;
}

export default function SearchResultRow({ item, query, onSelect }: Props) {
    const { t } = useTranslation();

    return (
        <button
            type="button"
            onClick={onSelect}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left cursor-pointer hover:bg-(--page-bg) transition-colors"
        >
            <span
                className={`size-8 rounded-lg bg-(--page-bg) flex items-center justify-center shrink-0 ${TYPE_COLOR[item.type]}`}
            >
                {TYPE_ICON[item.type]}
            </span>

            <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-(--text) truncate">
                    {highlight(item.title, query)}
                </span>
                <span className="block text-xs text-(--text-secondary) mt-px truncate">
                    {t(TYPE_LABEL_KEY[item.type])} · {highlight(item.meta, query)}
                </span>
            </span>

            <span className="text-[11px] text-(--text-secondary) shrink-0">
                {formatRelativeDate(item.updatedAt, t)}
            </span>
        </button>
    );
}
