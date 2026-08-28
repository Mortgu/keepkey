import { useTranslation } from "react-i18next";
import { Button } from "../button";
import { Dialog } from "../dialog";
import type { DialogProps } from "../dialog";
import type { ReactElement, ReactNode, SyntheticEvent } from "react";

/* ──────────────────────────────────────────────────────────────────────
   A `FormLike` is the structural slice of TanStack Form's form instance that
   <FormDialog> needs: a `handleSubmit` and a `Subscribe`. It is structurally
   compatible with the real `ReactFormExtendedApi` (whose `Subscribe` is a
   generic function), so a real form instance is assignable here without
   threading the form's full generic parameter list.
   ────────────────────────────────────────────────────────────────────── */

export interface FormLike {
    handleSubmit: () => void;
    Subscribe: (props: {
        selector: (state: { canSubmit: boolean; isSubmitting: boolean }) => [boolean, boolean];
        children: (selected: [boolean, boolean]) => ReactNode;
    }) => ReactNode | Promise<ReactNode>;
}

export interface FormDialogProps extends Pick<DialogProps, "open" | "defaultOpen" | "dismissible" | "size"> {
    form: FormLike;
    title: ReactNode;
    description?: ReactNode;
    /** Zusätzliche Elemente im Header, links vom Schließen-Button (z.B. Sprachumschalter). */
    headerActions?: ReactNode;
    formId: string;
    /** Eigener Trigger. Weglassen, wenn der Dialog über `open` gesteuert wird. */
    trigger?: ReactElement;
    onOpenChange?: (open: boolean) => void;
    /** Kurzform für `onOpenChange` — wird beim Schließen aufgerufen. */
    onClose?: () => void;
    submitLabel?: ReactNode;
    cancelLabel?: ReactNode;
    /** Zusätzliche Sperre für den Submit-Button, zusätzlich zu `canSubmit` des Formulars. */
    submitDisabled?: boolean;
    /** Überschreibt den Ladezustand des Submit-Buttons (z.B. externe Mutation). */
    submitLoading?: boolean;
    /** Footer button size (dialogs use "sm" or "xs"). */
    buttonSize?: "xs" | "sm";
    /** Optional content rendered above the form (e.g. a mutation error banner). */
    error?: ReactNode;
    /** The form fields — rendered inside the <form>. */
    children: ReactNode;
    /** className for the <form> element. */
    formClassName?: string;
}

/**
 * Dialog mit Formular-Footer: Abbrechen + Submit-Button, der `canSubmit` und
 * `isSubmitting` des TanStack-Form-Instance abonniert.
 */
export function FormDialog({
    form,
    title,
    description,
    headerActions,
    formId,
    trigger,
    open,
    defaultOpen,
    dismissible,
    size,
    onOpenChange,
    onClose,
    submitLabel,
    cancelLabel,
    submitDisabled = false,
    submitLoading,
    buttonSize = "sm",
    error,
    children,
    formClassName = "grid gap-4",
}: FormDialogProps) {
    const { t } = useTranslation();

    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    };

    const handleOpenChange = (nextOpen: boolean) => {
        onOpenChange?.(nextOpen);
        if (!nextOpen) onClose?.();
    };

    return (
        <Dialog
            trigger={trigger}
            open={open}
            defaultOpen={defaultOpen}
            dismissible={dismissible}
            size={size}
            onOpenChange={handleOpenChange}
        >
            <Dialog.Header title={title} description={description}>
                {headerActions}
            </Dialog.Header>
            <Dialog.Body>
                {error}
                <form id={formId} onSubmit={handleSubmit} className={formClassName}>
                    {children}
                </form>
            </Dialog.Body>
            <Dialog.Footer>
                <Dialog.Close
                    render={
                        <Button type="button" variant="border" size={buttonSize}>
                            {cancelLabel ?? t("button.cancel")}
                        </Button>
                    }
                />
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            form={formId}
                            size={buttonSize}
                            disabled={!canSubmit || submitDisabled}
                            loading={submitLoading ?? isSubmitting}
                        >
                            {submitLabel ?? t("button.save")}
                        </Button>
                    )}
                />
            </Dialog.Footer>
        </Dialog>
    );
}
