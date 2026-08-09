import { tv } from "tailwind-variants";
import type { HTMLAttributes } from "react";
import type { ComponentSize } from "@/components/tokens";
import type { DocumentStatus } from "@keepit/schemas";

export interface BadgeComponentProps extends HTMLAttributes<HTMLSpanElement> {
  variant: DocumentStatus;
  format?: "pdf" | "docx" | "html";
  count?: number | string;
  countVariant?: "success" | "error";
  size?: ComponentSize;
}

const VARIANT_LABELS: Record<NonNullable<BadgeComponentProps["variant"]>, string> = {
  GENERATED: "Generated",
  PENDING: "Pending",
  FAILED: "Failed",
  PROCESSING: "Processing",
  UPLOADED: "Uploaded",
  UPLOADING: "Uploading"
};

const badgeSizeStyles = {
  xs: "px-1.5 py-px text-[10px]",
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
};

const formatSizeStyles = {
  xs: "px-1.5 py-px text-[9px]",
  sm: "px-2 py-0.5 text-[11px]",
  md: "px-2.5 py-1 text-xs",
};

const countSizeStyles = {
  xs: "min-w-4 h-4 px-1 text-[10px]",
  sm: "min-w-5 h-5 px-1.5 text-xs",
  md: "min-w-6 h-6 px-2 text-sm",
};

const styles = tv({
  base: "inline-flex items-center justify-center w-fit",
  variants: {
    variant: {
      GENERATED: "bg-[#E6F2EC] text-[#00683F]",
      PENDING: "bg-[#FEF3C7] text-[#B45309]",
      FAILED: "bg-[#FDECEA] text-[#C0392B]",
      PROCESSING: "bg-[#E1F0FA] text-[#1D6FA4]",
      UPLOADED: "bg-[#E6F2EC] text-[#00683F]",
      UPLOADING: "bg-[#F0F4F1] text-[#4B5C52]",
    },
  },
});

const formatStyles = tv({
  base: "inline-flex items-center justify-center rounded font-medium font-mono bg-[#E0E4E1] text-[#2D4035]",
});

const countStyles = tv({
  base: "inline-flex items-center justify-center rounded-full font-medium text-white",
  variants: {
    countVariant: {
      success: "bg-[#00683F]",
      error: "bg-[#C0392B]",
    },
  },
  defaultVariants: {
    countVariant: "success",
  },
});


export function Badge({
  variant,
  format,
  count,
  countVariant = "success",
  size = "sm",
  className,
  children,
  ...props
}: BadgeComponentProps) {
  if (count !== undefined) {
    return (
      <span className={`${countStyles({ countVariant })} ${countSizeStyles[size]} ${className ?? ''}`} {...props}>
        {count}
      </span>
    );
  }

  if (format) {
    return (
      <span className={`${formatStyles()} ${formatSizeStyles[size]} ${className ?? ''}`} {...props}>
        {format.toUpperCase()}
      </span>
    );
  }

  return (
    <span className={`${styles({ variant })} rounded-full ${badgeSizeStyles[size]} ${className ?? ''}`} {...props}>
      {children ?? VARIANT_LABELS[variant]}
    </span>
  );
}
