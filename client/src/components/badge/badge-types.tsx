import type { HTMLAttributes } from "react";
import type { ComponentSize } from "@/components/size";

export interface BadgeComponentProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "generated" | "pending" | "failed" | "processing" | "draft";
    format?: "pdf" | "docx" | "html";
    count?: number | string;
    countVariant?: "success" | "error";
    size?: ComponentSize;
}

export const VARIANT_LABELS: Record<NonNullable<BadgeComponentProps["variant"]>, string> = {
    generated: "Generated",
    pending: "Pending",
    failed: "Failed",
    processing: "Processing",
    draft: "Draft",
};
