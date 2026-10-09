import { Button } from "@/components";
import { Dialog as BaseDialog, ScrollArea } from "@base-ui/react";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";
import { tv } from "tailwind-variants";
/**
 * Slots für einen base-ui-Dialog: Portal → Backdrop → Viewport → Popup,
 * darin Header / Toolbar / Body (scrollbar) / Actions.
 *
 * Die Anatomie setzt `dialog.tsx` zusammen — Call-Sites bauen sie nicht mehr
 * selbst. Wer nur einzelne Slots braucht (Sonderlayouts), kann sie hier direkt
 * abgreifen.
 */
export const dialogStyles = tv({
    slots: {
        Backdrop: 'fixed z-100 bg-white/25 backdrop-blur-xs transition-opacity duration inset-0',
        Viewport: 'fixed z-100 flex items-center justify-center overflow-hidden inset-0',
        ScrollView: 'box-border h-full overscroll-contain',
        ScrollContent: 'flex items-center justify-center min-h-full',
        Scrollbar: 'flex justify-center bg-black w-4 opacity-0 transition-opacity duration pointer-events-none z-100',
        ScrollbarThumb: 'w-full bg-(--destructive) z-101',
        Popup: [
            'relative flex flex-col max-h-full max-w-full border border-(--border) min-h-0 bg-white',
            'rounded-md data-nested-dialog-open:hidden',
            'transition-all '
        ],
        Header: 'flex items-center justify-between gap-1 p-4 border-b border-(--border)',
        Title: 'text-base leading-6 font-medium m-0',
        Description: 'flex items-center text-sm mt-1 leading-5 text-(--text-secondary)',
        Toolbar: 'flex items-center justify-start gap-4 p-4 border-b border-(--border)',
        Body: 'relative flex-auto flex min-h-0 overflow-hidden',
        BodyViewport: 'box-border flex-auto min-h-0 overscroll-contain',
        BodyContent: 'flex flex-col p-4 gap-4',
        Section: 'box-border flex flex-col gap-1 p-4',
        SectionTitle: 'text-sm leaning-5 font-bold m-0',
        SectionBody: 'text-sm leading-5',
        Actions: 'flex justify-end gap-3 p-4 border-t border-(--border)',
    },
    variants: {
        size: {
            sm: { Popup: 'w-[min(28rem,calc(100vw_-_2rem))]' },
            md: { Popup: 'w-[min(40rem,calc(100vw_-_2rem))]' },
            lg: { Popup: 'w-[min(50rem,calc(100vw_-_2rem))]' },
            xl: { Popup: 'w-[min(70rem,calc(100vw_-_2rem))]' }
        },
    },
    defaultVariants: {
        size: 'lg',
    },
});


type DialogSize = "sm" | "md" | "lg" | "xl";

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
