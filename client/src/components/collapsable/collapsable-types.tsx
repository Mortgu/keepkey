import type { ReactNode } from "react";
import type { ComponentSize } from "@/components/size";

export interface CollapsableComponentProps {
    label: ReactNode;
    children: ReactNode;
    className?: string;
    defaultOpen?: boolean;
    size?: ComponentSize;
}
