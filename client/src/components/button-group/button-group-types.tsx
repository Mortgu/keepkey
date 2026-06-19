import type { ReactNode } from "react";
import type { ComponentSize } from "@/components/size";

export interface ButtonGroupSegmentOption<TValue extends string = string> {
  value: TValue;
  label?: ReactNode;
  icon?: ReactNode;
  iconOnly?: boolean;
  disabled?: boolean;
  title?: string;
}

export interface ButtonGroupSegmentProps
  extends Omit<ButtonGroupSegmentOption, "value"> {
  first?: boolean;
  last?: boolean;
  active?: boolean;
  size?: ComponentSize;
  onClick?: () => void;
}

export interface ButtonGroupProps {
  children: ReactNode;
  className?: string;
}

export interface SegmentedButtonGroupProps<TValue extends string = string> {
  options: Array<ButtonGroupSegmentOption<TValue>>;
  value: TValue;
  onChange: (value: TValue) => void;
  size?: ComponentSize;
  className?: string;
}

export interface SplitButtonProps {
  label: ReactNode;
  icon?: ReactNode;
  onClick?: () => void;
  onDropdownClick?: () => void;
  dropdownIcon?: ReactNode;
  className?: string;
  disabled?: boolean;
}
