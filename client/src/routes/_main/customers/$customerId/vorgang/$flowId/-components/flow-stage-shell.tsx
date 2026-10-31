import type { ReactNode } from "react";
import type { FlowStage } from "../../../-components/flow/flow-types";
import { useTranslation } from "react-i18next";
import { cn } from "tailwind-variants";
import { useFormatters } from "@/hooks";
import { Dot } from "lucide-react";
import { stateTone } from "../../../-components/flow/flow-meta";

interface Props {
    stage: FlowStage;
    headerActions?: ReactNode;
    children?: ReactNode;
}

export default function StageShell({ stage, headerActions, children }: Props) {
    const { t } = useTranslation();
    const { formatDate } = useFormatters();

    const muted = stage.state === "cancelled";

    return (
        <section id={stage.kind} className={cn("scroll-mt-4 rounded-md border border-(--border) bg-white", muted && "bg-(--page-bg)")}>
            {stage.state !== "done" && (
                <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="min-w-0 grid">
                            <h2 className="text-md font-medium">{t(`flows.station.${stage.kind}.label`)}</h2>
                            <p className="flex items-center gap-1 text-sm">
                                {stage.number && (
                                    <>
                                        <span className={cn("font-mono text-(--text)", stage.state === "cancelled" && "line-through")}>
                                            {stage.number}
                                        </span>
                                        <Dot size={14} strokeOpacity={0.5} />
                                    </>
                                )}

                                {stage.date && (
                                    <>
                                        <span className="text-(--fg-3)">{stage.date}</span>
                                        <Dot size={14} strokeOpacity={0.5} />
                                    </>
                                )}

                                <span className={stateTone(stage.state)}>{stage.note ?? t(`flows.state.${stage.state}`)}</span>
                            </p>
                        </div>
                    </div>

                    {headerActions && <div className="flex flex-wrap gap-1.5">{headerActions}</div>}
                </div>
            )}

            {/* AB/Rechnung benötigen technisch (DB-FK) eine angelegte Bestellung, auch wenn
                sie fachlich kein nachfolgender Schritt sind. */}
            {stage.state === "locked" && (
                <div className="border-t border-(--border)">
                    <p className="px-4 py-4 text-[13px] text-(--fg-3)">{t("flows.detail.lockedHint")}</p>
                </div>
            )}

            {stage.state === "cancelled" && !children && (
                <div className="border-t border-(--border)">
                    <p className="px-4 py-4 text-[13px] text-(--fg-3)">{t("flows.detail.cancelledHint")}</p>
                </div>
            )}

            {stage.state === "action" && !children && (
                <div className="border-t border-(--border)">
                    <p className="px-4 py-4 text-[13px] text-(--fg-3)">{t("flows.detail.actionHint")}</p>
                </div>
            )}

            {children}
        </section>
    );
}