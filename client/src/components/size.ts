export type ComponentSize = "xs" | "sm" | "md";

export const SIZE_STYLES = {
  xs: "h-[34px] text-xs",
  sm: "h-[38px] text-sm",
  md: "h-[42px] text-md",
} as const satisfies Record<ComponentSize, string>;