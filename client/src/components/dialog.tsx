import { createContext, useContext, useMemo } from "react";
import { Dialog as BaseDialog, ScrollArea } from "@base-ui/react";
import { X } from "lucide-react";
import { Button } from "./button";
import { dialogStyles } from "./dialog-styles";
import type { ReactNode } from "react";

type DialogSize = "sm" | "md" | "lg";

type DialogSlots = ReturnType<typeof dialogStyles>;

/* Modul-privat: react-refresh erlaubt hier nur Komponenten-Exporte. */
const DialogStylesContext = createContext<DialogSlots | null>(null);

function useDialogStyles(): DialogSlots {
    const styles = useContext(DialogStylesContext);
    if (!styles) {
        throw new Error("Dialog.* muss innerhalb von <Dialog> gerendert werden.");
    }
    return styles;
}

export interface DialogProps {
    /** Controlled-Modus — der Regelfall, siehe `useModal()`. */
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    /** Initial geöffnet (nur uncontrolled). */
    defaultOpen?: boolean;
    /**
     * Ob Klick auf den Backdrop bzw. Fokusverlust den Dialog schließt.
     * Default `false` — entspricht dem bisherigen Verhalten aller Modals.
     */
    dismissible?: boolean;
    size?: DialogSize;
    className?: string;
    children: ReactNode;
}

export interface DialogHeaderProps {
    title: ReactNode;
    description?: ReactNode;
    /** Zusätzliche Aktionen links vom Schließen-Button. */
    children?: ReactNode;
    className?: string;
}

export interface DialogSectionProps {
    children?: ReactNode;
    className?: string;
}

function DialogHeader({ title, description, children, className }: DialogHeaderProps) {
    const styles = useDialogStyles();

    return (
        <div className={styles.Header({ className })}>
            <div className="grid">
                <BaseDialog.Title className={styles.Title()}>{title}</BaseDialog.Title>
                {description && (
                    <BaseDialog.Description className={styles.Description()}>
                        {description}
                    </BaseDialog.Description>
                )}
            </div>

            <div className="flex items-center gap-2">
                {children}
                <BaseDialog.Close
                    render={<Button variant="border" size="xs" icon={<X size={14} />} iconOnly />}
                />
            </div>
        </div>
    );
}

/** Optionale Zeile zwischen Header und Body — Suche, Filter, „Neu"-Button. */
function DialogToolbar({ children, className }: DialogSectionProps) {
    const styles = useDialogStyles();
    return <div className={styles.Toolbar({ className })}>{children}</div>;
}

/** Scrollbarer Inhaltsbereich. Der Dialog wächst bis `max-h`, dann scrollt der Body. */
function DialogBody({ children, className }: DialogSectionProps) {
    const styles = useDialogStyles();

    return (
        <ScrollArea.Root className={styles.Body()}>
            <ScrollArea.Viewport className={styles.BodyViewport()}>
                <ScrollArea.Content className={styles.BodyContent({ className })}>
                    {children}
                </ScrollArea.Content>
            </ScrollArea.Viewport>
        </ScrollArea.Root>
    );
}

function DialogFooter({ children, className }: DialogSectionProps) {
    const styles = useDialogStyles();
    return <div className={styles.Actions({ className })}>{children}</div>;
}

/**
 * Dialog auf Basis von base-ui. Kapselt Portal / Backdrop / Viewport / Popup,
 * damit Call-Sites nur noch Header, Body und Footer schreiben.
 *
 * Der Dialog kennt seinen Öffner bewusst nicht: Wer ihn öffnet, hält den Zustand
 * (`useModal()`) und rendert ihn. Ein Modal, das seinen Trigger selbst mitbringt,
 * wäre ein zweiter Weg, dasselbe zu tun.
 */
function Dialog({
    open,
    onOpenChange,
    defaultOpen,
    dismissible = false,
    size,
    className,
    children,
}: DialogProps) {
    const styles = useMemo(() => dialogStyles({ size }), [size]);

    return (
        <BaseDialog.Root
            open={open}
            defaultOpen={defaultOpen}
            onOpenChange={(nextOpen) => onOpenChange?.(nextOpen)}
            disablePointerDismissal={!dismissible}
        >
            <BaseDialog.Portal>
                <BaseDialog.Backdrop className={styles.Backdrop()} />
                <BaseDialog.Viewport className={styles.Viewport()}>
                    <BaseDialog.Popup className={styles.Popup({ className })}>
                        <DialogStylesContext.Provider value={styles}>
                            {children}
                        </DialogStylesContext.Provider>
                    </BaseDialog.Popup>
                </BaseDialog.Viewport>
            </BaseDialog.Portal>
        </BaseDialog.Root>
    );
}

Dialog.Header = DialogHeader;
Dialog.Toolbar = DialogToolbar;
Dialog.Body = DialogBody;
Dialog.Footer = DialogFooter;
/** Schließt den Dialog. `render` nimmt ein beliebiges Element, z.B. <Button/>. */
Dialog.Close = BaseDialog.Close;

export { Dialog };
