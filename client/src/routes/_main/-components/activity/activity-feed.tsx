import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { RotateCw } from "lucide-react";
import { tv } from "tailwind-variants";
import ActivityFeedCard from "./activity-feed-card";
import type { Activity } from "@keepit/schemas";
import { Button, ListSkeleton, RouteError, Skeleton } from "@/components";
import { useActivities } from "@/hooks";

const activityStyles = tv({
    slots: {
        header: 'flex items-center justify-between gap-2',
        group: 'grid gap-2',
        groupLabel: 'text-sm font-medium text-(--fg-3)',
        list: 'grid',
    }
});

/** Kalendertag als Sortier- und Gruppierschlüssel, unabhängig von der Uhrzeit. */
function dayKey(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

type Group = { key: string; date: Date; items: Array<Activity> };

function groupByDay(items: Array<Activity>): Array<Group> {
    const groups = new Map<string, Group>();

    for (const activity of items) {
        const date = new Date(activity.createdAt);
        const key = dayKey(date);
        const group = groups.get(key);

        if (group) {
            group.items.push(activity);
        } else {
            groups.set(key, { key, date, items: [activity] });
        }
    }

    return [...groups.values()];
}

function ActivityCardSkeleton() {
    return (
        <div className="py-3 px-3 flex items-center gap-4 bg-(--page-bg) rounded-xl border border-(--border)">
            <Skeleton shape="circle" className="w-9 rounded-lg" />
            <div className="grid gap-1.5 grow">
                <Skeleton className="w-2/3" />
                <Skeleton className="w-16" />
            </div>
        </div>
    );
}

export default function ActivityFeed() {
    const { t, i18n } = useTranslation();
    const styles = activityStyles();
    const { items, isPending, isFetching, error, refetch } = useActivities();

    const groups = useMemo(() => groupByDay(items), [items]);

    const labelFor = (date: Date) => {
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        if (dayKey(date) === dayKey(today)) return t("dashboard.activity.today");
        if (dayKey(date) === dayKey(yesterday)) return t("dashboard.activity.yesterday");

        return new Intl.DateTimeFormat(i18n.language, { dateStyle: "medium" }).format(date);
    };

    return (
        <div className="border-b border-(--border) p-4 grid gap-3">
            <div className={styles.header()}>
                <p className="text-lg font-semibold">{t("dashboard.activity.title")}</p>
                <Button
                    variant="border"
                    size="fit_sm"
                    icon={<RotateCw size={14} />}
                    loading={isFetching}
                    onClick={() => refetch()}
                >
                    {t("dashboard.activity.reload")}
                </Button>
            </div>

            {isPending ? (
                <ListSkeleton rows={4} skeleton={<ActivityCardSkeleton />} />
            ) : error ? (
                <RouteError error={error} onRetry={refetch} />
            ) : groups.length === 0 ? (
                <div className="py-3 px-3 flex items-center justify-start gap-4 border border-(--border) bg-(--page-bg) rounded-xl">
                    <div className="flex flex-col gap-1 items-start justify-center">
                        <p className="text-md font-medium">{t("dashboard.activity.empty")}</p>
                    </div>
                </div>
            ) : (
                <div className="grid gap-4">
                    {groups.map((group) => (
                        <div key={group.key} className={styles.group()}>
                            <p className={styles.groupLabel()}>{labelFor(group.date)}</p>
                            <div className={styles.list()}>
                                {group.items.map((activity) => (
                                    <ActivityFeedCard key={activity.id} activity={activity} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
