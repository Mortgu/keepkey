import { useState } from "react";
import { useTranslation } from "react-i18next";
import OrderModalOfferCard from "./order-modal.offer-card";
import type { Offer } from "@keepit/schemas";
import { ListSkeleton, RouteError, SearchBar, Skeleton } from "@/components";
import { useDebouncedValue, useOffers } from "@/hooks";

interface Props {
    selectedId?: string;
    onSelect: (offer: Offer) => void;
}

/** Linke Spalte: Suche und offene Angebote. Beides serverseitig gefiltert. */
export default function OrderModalOfferList({ selectedId, onSelect }: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const debounced = useDebouncedValue(search.trim(), 250);

    const { items, nextCursor, isPending, error } = useOffers({
        status: "open",
        search: debounced || undefined,
    });

    return (
        <div className="grid grid-rows-[auto_minmax(0,1fr)] min-h-0 h-full border-r border-(--border)">
            <div className="p-3 border-b border-(--border)">
                <SearchBar
                    value={search}
                    onChange={setSearch}
                    placeholder={t("orders.modal.searchPlaceholder")}
                    className="w-full"
                />
                {!isPending && !error && (
                    <p className="mt-2 text-xs text-(--text-secondary)">
                        {t("orders.modal.resultCount", { count: items.length })}
                        {nextCursor && ` · ${t("orders.modal.moreResults")}`}
                    </p>
                )}
            </div>

            <div role="listbox" aria-label={t("orders.selectOffer")} className="overflow-y-auto p-2 grid gap-1 content-start">
                {error && <RouteError error={error} />}
                {isPending && <ListSkeleton rows={6} skeleton={<Skeleton className="h-16" />} />}
                {!isPending && !error && items.length === 0 && (
                    <p className="py-8 text-center text-sm text-(--text-secondary)">
                        {debounced ? t("orders.modal.noMatch", { query: debounced }) : t("orders.emptyOffers")}
                    </p>
                )}
                {items.map((offer) => (
                    <OrderModalOfferCard
                        key={offer.id}
                        offer={offer}
                        selected={offer.id === selectedId}
                        onSelect={onSelect}
                    />
                ))}
            </div>
        </div>
    );
}
