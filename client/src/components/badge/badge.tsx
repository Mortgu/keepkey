import { tv } from "tailwind-variants";
import { VARIANT_LABELS, type BadgeComponentProps } from "./badge-types";

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
      generated: "bg-[#E6F2EC] text-[#00683F]",
      pending: "bg-[#FEF3C7] text-[#B45309]",
      failed: "bg-[#FDECEA] text-[#C0392B]",
      processing: "bg-[#E1F0FA] text-[#1D6FA4]",
      draft: "bg-[#F0F4F1] text-[#4B5C52]",
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

  if (variant) {
    return (
      <span className={`${styles({ variant })} rounded-full ${badgeSizeStyles[size]} ${className ?? ''}`} {...props}>
        {children ?? VARIANT_LABELS[variant]}
      </span>
    );
  }

  return (
    <span className={`${styles()} rounded-full ${badgeSizeStyles[size]} ${className ?? ''}`} {...props}>
      {children}
    </span>
  );
}
