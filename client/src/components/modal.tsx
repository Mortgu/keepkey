import type {ReactNode} from "react";

export default function Modal({ children }: { children: ReactNode }) {
    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex-1 overflow-y-auto flex flex-col">
                    <div className="p-4 space-y-4 flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}