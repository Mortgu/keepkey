import { useTranslation } from "react-i18next";
import { useNavigate } from "@tanstack/react-router";
import {
    Dot,
    FilePlus2,
    FileText,
    FileX2,
    Layers,
    Plus,
    RotateCcw,
    SquarePen,
    Trash2,
    Upload
} from "lucide-react";
import { tv } from "tailwind-variants";
import type { Activity } from "@keepit/schemas";

const activityFeedCardStyles = tv({
    slots: {
        card: [
            'flex items-center justify-start gap-4',
            'rounded-xl'
        ],
        icon: [
            "flex items-center justify-center aspect-square rounded-lg",
        ],
        content: 'grid gap-0.5',
    },
    variants: {
    },
    defaultVariants: {

    },
});

type Appearance = { icon: typeof SquarePen; };

/**
 * Icon und Farbe je Aktivitätstyp. Unbekannte Typen — etwa aus einer älteren
 * Server-Version — fallen auf einen neutralen Eintrag zurück, statt die Liste
 * zu sprengen.
 */
const APPEARANCE: Record<string, Appearance> = {
    "offer.created": { icon: Plus },
    "offer.updated": { icon: SquarePen },
    "offer.restored": { icon: RotateCcw },
    "offer.renewed": { icon: RotateCcw },
    "offer.extended": { icon: Plus },
    "offer.deleted": { icon: Trash2 },

    "order.created": { icon: Plus },
    "order.updated": { icon: SquarePen },
    "order.restored": { icon: RotateCcw },
    "order.deleted": { icon: Trash2 },

    "document.generation.requested": { icon: FilePlus2 },
    "document.uploaded": { icon: Upload },
    "document.replaced": { icon: FileText },
    "document.renamed": { icon: SquarePen },
    "document.deleted": { icon: FileX2 },

    "customer.created": { icon: Plus },
    "customer.updated": { icon: SquarePen },
    "customer.deleted": { icon: Trash2 },

    "tariff.version.created": { icon: Layers },
    "tariff.version.restored": { icon: RotateCcw },
};

const FALLBACK: Appearance = { icon: SquarePen };

/**
 * Ziel des Kartenklicks. Für Angebote und Bestellungen gibt es (noch) keine
 * Detailroute — wie die globale Suche führt der Klick deshalb auf die Liste,
 * vorgefiltert auf die Nummer des Vorgangs. Gelöschtes und Dokumente bleiben
 * ohne Ziel: dort gibt es nichts zu öffnen.
 */
function targetOf(activity: Activity): { to: string; search?: { search: string } } | null {
    if (activity.type.endsWith(".deleted")) return null;

    const payload = activity.payload as { quoteId?: string; orderId?: string };

    switch (activity.entity) {
        case "OFFER":
            return { to: "/offers", ...(payload.quoteId ? { search: { search: payload.quoteId } } : {}) };
        case "ORDER":
            return { to: "/orders", ...(payload.orderId ? { search: { search: payload.orderId } } : {}) };
        case "CUSTOMER":
            return { to: `/customers/${activity.entityId}` };
        default:
            return null;
    }
}

export interface ActivityFeedCardProps {
    activity: Activity;
}

export default function ActivityFeedCard({ activity }: ActivityFeedCardProps) {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();

    const { icon: Icon } = APPEARANCE[activity.type] ?? FALLBACK;
    const styles = activityFeedCardStyles({});

    const actor = activity.actor?.name || t("dashboard.activity.system");
    /*
     * Die Payload kommt als `replace`, nicht als Options-Objekt: sonst könnten
     * ihre Schlüssel mit i18next-Optionen (count, context, …) kollidieren.
     */
    const description = t(
        [`dashboard.activity.types.${activity.type}`, "dashboard.activity.types.unknown"],
        { replace: activity.payload },
    );

    const time = new Intl.DateTimeFormat(i18n.language, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(new Date(activity.createdAt));

    const target = targetOf(activity);

    return (
        <div className="flex items-center gap-x-4 mt-4">
            <div className="w-fit h-full relative">
                <div className="relative w-8 aspect-square flex items-center justify-center bg-white text-black rounded-full z-1 outline-4 outline-white">
                    <Icon size={18} strokeWidth={2.2} />
                </div>
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[2px] h-full bg-(--border) z--1 group-last:hidden" />
            </div>
            <div className="h-full grid gap-1">
                <p className="text-md flex items-center gap-2"><b>{actor}</b> {description}</p>
                <p className="text-sm flex items-center text-gray-400">{time} <Dot size={18} /> </p>
            </div>
        </div>
    );
}
