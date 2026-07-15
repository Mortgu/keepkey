import type { ReactNode } from "react";

type Props = {
    title: string;
    actions?: ReactNode;
    children: ReactNode;
}

export default function SettingsCard({ title, actions, children }: Props) {
    return (
        <div className="grid gap-4 bg-(--page-bg) border border-(--border) rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 border-b border-(--border) bg-white">
                <h1 className="text-xl ">{title}</h1>

                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            <div className="px-4 pb-4 bt-2">
                {children}
            </div>
        </div>
    )
}
