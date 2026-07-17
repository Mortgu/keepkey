import { Fragment  } from "react";
import { Plus } from "lucide-react";
import type {ReactNode} from "react";
import { Button, ListSkeleton, RouteError, Skeleton } from "@/components";

export interface ListPageProps<TItem> {
    title: ReactNode;
    items: Array<TItem>;
    isPending?: boolean;
    error?: unknown;
    showCount?: boolean;
    onCreate?: () => void;
    createLabel?: ReactNode;
    /** Extra toolbar content (e.g. a SearchBar) rendered left of the create button. */
    toolbar?: ReactNode;
    renderItem: (item: TItem) => ReactNode;
    keyOf?: (item: TItem) => string | number;
    skeleton?: ReactNode;
    skeletonRows?: number;
    emptyLabel?: ReactNode;
    /** Content rendered after the body (e.g. the create/edit modal). */
    children?: ReactNode;
}

export function ListPage<TItem>({
    title,
    items,
    isPending,
    error,
    showCount = false,
    onCreate,
    createLabel,
    toolbar,
    renderItem,
    keyOf,
    skeleton,
    skeletonRows = 6,
    emptyLabel,
    children,
}: ListPageProps<TItem>) {
    return (
        <>
            <div className="mb-4 flex items-center justify-between gap-4">
                <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
                    {title}
                    {showCount ? ` (${items.length})` : null}
                </h1>
                <div className="flex items-center gap-4">
                    {toolbar}
                    {onCreate && (
                        <Button
                            size="sm"
                            icon={<Plus className="size-4" />}
                            onClick={onCreate}
                        >
                            {createLabel}
                        </Button>
                    )}
                </div>
            </div>

            {error ? (
                <RouteError error={error} />
            ) : isPending ? (
                <ListSkeleton
                    rows={skeletonRows}
                    skeleton={skeleton ?? <Skeleton shape="rect" />}
                />
            ) : items.length === 0 ? (
                <p className="text-sm text-(--text-secondary) py-8 text-center">
                    {emptyLabel ?? ""}
                </p>
            ) : (
                <div className="grid gap-2">
                    {items.map((item, index) => (
                        <Fragment key={keyOf ? keyOf(item) : index}>
                            {renderItem(item)}
                        </Fragment>
                    ))}
                </div>
            )}

            {children}
        </>
    );
}
