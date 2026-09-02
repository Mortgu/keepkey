import type { ReactNode } from "react";

interface Props {
    title: string;
    description: string;
    /** Grosse Kennzahl unter dem Diagramm — der Wert, um den es geht. */
    value: string;
    valueLabel: string;
    children: ReactNode;
}

/**
 * Rahmen für ein Dashboard-Diagramm.
 *
 * Gemeinsam statt je Chart, damit beide gleich sitzen und die Kartenoptik nicht
 * an zwei Stellen gepflegt werden muss.
 */
export default function ChartCard({ title, description, value, valueLabel, children }: Props) {
    return (
        <div className="flex-1 flex flex-col border border-(--border) bg-(--page-bg) rounded-xl min-w-[420px] overflow-hidden">
            <div className="grid gap-0.5 px-4 py-3">
                <h2 className="text-md">{title}</h2>
                <p className="text-sm text-gray-500">{description}</p>
            </div>

            <div className="w-full border-t border-(--border) bg-white rounded-xl overflow-hidden">
                {children}

                <div className="flex flex-col px-6 py-4">
                    <p className="text-[40px] leading-tight font-medium">{value}</p>
                    <p className="text-md font-normal text-gray-500">{valueLabel}</p>
                </div>
            </div>
        </div>
    );
}
