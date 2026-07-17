import { formatEur } from "@/utils/utils";
import { Scroll } from "lucide-react";

interface Props {
    title: string;
    total: number;
    volume: number;
}

export default function StatCard({ title, total, volume }: Props) {
    return (
        <div className="flex-1 grid gap-4 py-3 px-4">
            <div className="flex items-center gap-3">
                <div className="bg-(--primary-500) p-2 rounded-xl text-white outline-2 outline-(--primary-500) outline-offset-2"><Scroll size={23} /></div>
                <div className="grid">
                    <p className="text-lg font-semibold">{title}</p>
                    <p className="text-sm font-medium text-gray-400">GJ: 2026</p>
                </div>
            </div>

            <div className="flex items-center gap-8">
                <div className="grid gap-1">
                    <span className="text-sm text-(--text-secondary) font-medium">Insgesamt:</span>
                    <p className="text-2xl font-semibold font-mono">
                        {total}
                    </p>
                </div>
                <div className="grid gap-1">
                    <span className="text-sm text-(--text-secondary) font-medium">Volumen:</span>
                    <p className="text-2xl font-semibold font-mono">
                        {formatEur(volume)}
                    </p>
                </div>
            </div>
        </div>
    )
}