import type { ReactNode } from "react";

export interface CollapsableComponentProps {
    label: ReactNode;
    children: ReactNode;
    className?: string;
    defaultOpen?: boolean;
}
