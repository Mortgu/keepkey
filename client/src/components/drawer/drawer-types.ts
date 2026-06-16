import type { ReactNode } from "react";

export interface DrawerProps {
    open: boolean;
    onClose: () => void;
    children?: ReactNode;
    wide?: boolean;
    className?: string;
}

export interface DrawerHeaderProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    className?: string;
}

export interface DrawerBodyProps {
    children?: ReactNode;
    className?: string;
}

export interface DrawerFooterProps {
    children?: ReactNode;
    className?: string;
}
