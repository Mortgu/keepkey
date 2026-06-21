import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RecentActivityRow } from "./recent-activity-row";
import { useOrderHook } from "@/hooks";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";

const LIMIT = 3;

export function RecentOrdersWidget() {
    const { t } = useTranslation();
    const { orders, isPending } = useOrderHook();

    const recent = useMemo(
        () =>
            [...orders]
                .sort(
                    (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime(),
                )
                .slice(0, LIMIT),
        [orders],
    );

    return (
        <div className="border border-(--border) rounded-md bg-white">
            {isPending ? (
                <p className="text-sm text-(--text-secondary) px-4 py-3">
                    {t("common.loading")}
                </p>
            ) : recent.length === 0 ? (
                <p className="text-sm text-(--text-secondary) px-4 py-3">
                    {t("dashboard.noActivity")}
                </p>
            ) : (
                recent.map((order) => (
                    <RecentActivityRow
                        key={order.id}
                        title={order.customer.companyName}
                        subtitle={order.orderId}
                        amount={formatEur(0)} //order.offer.net_amount
                        date={formatDate(order.createdAt)}
                    />
                ))
            )}
        </div>
    );
}
