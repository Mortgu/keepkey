import { LoaderCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";

export interface SpinnerProps {
    size?: number;
    className?: string;
    /**
     * Ansage für Screenreader, Standard `common.loading`. `false`, wenn der
     * Kontext den Ladezustand schon trägt (z. B. ein Button mit Beschriftung).
     */
    label?: string | false;
}

/** Drehender Ladeindikator. */
export function Spinner({ size, className, label }: SpinnerProps) {
    const { t } = useTranslation();
    const icon = <LoaderCircle size={size} className={cn("animate-spin", className)} aria-hidden />;

    if (label === false) return icon;

    return (
        <span role="status" aria-label={label ?? t("common.loading")} className="inline-flex">
            {icon}
        </span>
    );
}
