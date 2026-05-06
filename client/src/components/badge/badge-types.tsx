import type { HTMLAttributes } from "react";

export interface BadgeComponentProps extends HTMLAttributes<HTMLSpanElement> {
    variant?: "generated" | "pending" | "failed" | "processing" | "draft";
    format?: "pdf" | "docx" | "html";
    count?: number | string;
    countVariant?: "success" | "error";
}

export const VARIANT_LABELS: Record<NonNullable<BadgeComponentProps["variant"]>, string> = {
    generated: "Generated",
    pending: "Pending",
    failed: "Failed",
    processing: "Processing",
    draft: "Draft",
};
