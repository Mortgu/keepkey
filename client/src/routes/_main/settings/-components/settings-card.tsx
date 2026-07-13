import type {ReactNode} from "react";

type Props = {
    title: string;
    actions?: ReactNode;
    children: ReactNode;
}

export default function SettingsCard({title, actions, children}: Props) {
    return (
        <div className="grid gap-4 border border-(--border) p-4 bg-(--page-bg) rounded-md shadow-sm">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">{title}</h1>

                {actions && (
                    <div className="flex items-center gap-2">
                        {actions}
                    </div>
                )}
            </div>

            {children}
        </div>
    )
}
