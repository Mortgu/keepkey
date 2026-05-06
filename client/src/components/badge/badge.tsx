import { tv } from "tailwind-variants";
import { VARIANT_LABELS, type BadgeComponentProps } from "./badge-types";

const styles = tv({
  base: "inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium",
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
  base: "inline-flex items-center justify-center px-2 py-0.5 rounded text-[11px] font-medium font-mono bg-[#E0E4E1] text-[#2D4035]",
});

const countStyles = tv({
  base: "inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-xs font-medium text-white",
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
  className,
  children,
  ...props
}: BadgeComponentProps) {
  if (count !== undefined) {
    return (
      <span className={countStyles({ countVariant, className })} {...props}>
        {count}
      </span>
    );
  }

  if (format) {
    return (
      <span className={formatStyles({ className })} {...props}>
        {format.toUpperCase()}
      </span>
    );
  }

  if (variant) {
    return (
      <span className={styles({ variant, className })} {...props}>
        {children ?? VARIANT_LABELS[variant]}
      </span>
    );
  }

  return (
    <span className={styles({ className })} {...props}>
      {children}
    </span>
  );
}
