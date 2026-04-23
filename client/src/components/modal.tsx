import { X } from "lucide-react";
import { useEffect } from "react";
import Button from "./button/button";

interface ModalProps {
    open: boolean;
    cancelFn?: () => void;
    primaryFn?: () => void;
    children?: React.ReactNode;
    className?: string;
};

function Header({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

function Content({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

function Footer({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}

function ModalDialog({ open, cancelFn, primaryFn, children }: ModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && open) {
                if (cancelFn) cancelFn();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, cancelFn]);

    if (!open) return null;

    const childArray = Array.isArray(children) ? children : [children];
    const header = childArray.find((c: any) => c?.type === Header);
    const content = childArray.find((c: any) => c?.type === Content);
    const footer = childArray.find((c: any) => c?.type === Footer);

    return (
        <div className="fixed inset-0 bg-white/50 backdrop-blur-xs z-50 flex items-center justify-center">
            <div className="overflow-hidden relative border border-(--border) bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col">

                <div className="flex items-center justify-between pt-5 px-5">
                    {header}
                    <Button onClick={cancelFn} variant="secondary" size="xs" icon={<X className="size-4" />} iconOnly />
                </div>

                <div className="py-5 px-5">
                    {content}
                </div>

                <div className="flex items-center justify-end gap-2 py-3.5 px-5 border-t border-(--border) bg-(--subtle-50)">
                    {footer ?? (
                        <>
                            <Button onClick={cancelFn} variant="secondary" size="sm">Close</Button>
                            <Button onClick={primaryFn} variant="primary" size="sm">Save</Button>
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

export default ModalDialog;
