import { tv } from "tailwind-variants";
import { cn } from "@/lib/utils";

const skeletonStyles = tv({
    base: "animate-pulse rounded bg-(--border-200)",
    variants: {
        shape: {
            text: "h-3.5 w-full",
            rect: "h-20 w-full",
            circle: "aspect-square rounded-full",
        },
    },
    defaultVariants: {
        shape: "text",
    },
});

export interface SkeletonProps {
    shape?: "text" | "rect" | "circle";
    className?: string;
}

export function Skeleton({ shape, className }: SkeletonProps) {
    return <div className={skeletonStyles({ shape, className })} aria-hidden />;
}

export function PageHeaderSkeleton() {
    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <Skeleton shape="text" className="h-7 w-48" />
            </div>
        </div>
    );
}

export function OfferCardSkeleton() {
    return (
        <div className="border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border)">
                <div className="grid gap-2 flex-1">
                    <div className="flex items-center gap-2">
                        <Skeleton shape="text" className="h-4 w-16" />
                        <Skeleton shape="text" className="h-4 w-32" />
                    </div>
                    <div className="flex flex-wrap items-center gap-4">
                        <Skeleton shape="text" className="h-3 w-40" />
                        <Skeleton shape="text" className="h-3 w-28" />
                    </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                    <Skeleton shape="text" className="h-4 w-24" />
                    <Skeleton shape="text" className="h-3 w-16" />
                </div>
            </div>
            <div className="px-4 py-3 bg-(--subtle-50)">
                <Skeleton shape="rect" className="h-12" />
            </div>
        </div>
    );
}

export interface ListSkeletonProps {
    rows?: number;
    skeleton: React.ReactNode;
    className?: string;
}

export function ListSkeleton({ rows = 5, skeleton, className }: ListSkeletonProps) {
    return (
        <div className={cn("grid gap-2", className)}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i}>{skeleton}</div>
            ))}
        </div>
    );
}
