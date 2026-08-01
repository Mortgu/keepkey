import type { ReactNode } from "react";

export interface TabItem {
    value: string;
    label: ReactNode;
    /** Optional count badge (underline variant). Turns green when the tab is active. */
    count?: number;
    /** Optional icon (icon variant). Rendered before the label. */
    icon?: ReactNode;
}

export interface TabsCommonProps {
    tabs: Array<TabItem>;
    value: string;
    onChange: (value: string) => void;
    className?: string;
}
