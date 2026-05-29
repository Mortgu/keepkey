import {X} from "lucide-react";
import {useEffect} from "react";
import {Button} from "@/components";
import type {ComponentSize} from "@/components/size";

interface ModalProps {
    onClose: () => void;
    children?: React.ReactNode;
    className?: string;
    size?: ComponentSize;
}

function Header({children}: { children: React.ReactNode }) {
    return <div className="w-full flex items-center justify-between">{children}</div>;
}

function Content({children}: { children: React.ReactNode }) {
    return <>{children}</>;
}

function Footer({children}: { children: React.ReactNode }) {
    return <>{children}</>;
}

function ModalDialog({onClose, children, size = "sm"}: ModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [onClose]);

    const childArray = Array.isArray(children) ? children : [children];
    const header = childArray.find((c: any) => c?.type === Header);
    const content = childArray.find((c: any) => c?.type === Content);
    const footer = childArray.find((c: any) => c?.type === Footer);

    return (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-xs z-50 flex items-center justify-center">
            <div
                className="scrollbar-none overflow-x-hidden relative border border-(--border) bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex items-center justify-between pt-5 px-5 gap-2">
                    {header}
                    <Button
                        onClick={onClose}
                        variant="secondary"
                        size="xs"
                        icon={<X className="size-4"/>}
                        iconOnly
                    />
                </div>

                <div className="scrollbar-none py-5 px-5">{content}</div>

                <div
                    className="flex items-center justify-end gap-2 py-3.5 px-5 border-t border-(--border) bg-(--subtle-50)">
                    {footer ?? (
                        <>
                            <Button onClick={onClose} variant="secondary" size={size}>
                                Abbrechen
                            </Button>
                            <Button variant="primary" size={size}>
                                Speichern
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

ModalDialog.Header = Header;
ModalDialog.Content = Content;
ModalDialog.Footer = Footer;

export {ModalDialog};
