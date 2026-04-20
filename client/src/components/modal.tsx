import type { ReactNode } from "react";

type ModalProps = {
    children: ReactNode;
};

type ModalHeaderProps = {
    title: string;
    description?: string;
};

export function ModalHeader({ title, description }: ModalHeaderProps) {
    return (
        <div className="px-4 pt-4 pb-2 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            {description && (
                <p className="text-sm text-gray-500 mt-0.5">{description}</p>
            )}
        </div>
    );
}

export default function Modal({ children }: ModalProps) {
    return (
        <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex-1 overflow-y-auto flex flex-col">
                    <div className="p-4 space-y-4 flex-1">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}