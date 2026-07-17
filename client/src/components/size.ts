export type ComponentSize = "xs" | "sm" | "md";

export const SIZE_STYLES = {
  md: `px-4.5 h-[44px] text-[16px]`,
  sm: `px-4 h-[37.5px] text-[14px]`,
  xs: `px-3.5 h-[32px] text-[13px]`,
} as const satisfies Record<ComponentSize, string>;