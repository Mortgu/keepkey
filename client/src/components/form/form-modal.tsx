import type { ReactNode, SyntheticEvent } from "react";
import { Button, ModalDialog } from "@/components";

/* ──────────────────────────────────────────────────────────────────────
   A `FormLike` is the structural slice of TanStack Form's form instance that
   <FormModal> needs: a `handleSubmit` and a `Subscribe`. It is structurally
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

export interface FormModalProps {
    form: FormLike;
    onClose: () => void;
    title: ReactNode;
    formId: string;
    submitLabel?: string;
    cancelLabel?: string;
    /** Footer button size (modals use "sm" or "xs"). */
    size?: "xs" | "sm";
    /** Optional content rendered above the form (e.g. a mutation error banner). */
    error?: ReactNode;
    /** The form fields — rendered inside the <form>. */
    children: ReactNode;
    /** className for the <form> element. */
    formClassName?: string;
}

export function FormModal({
    form,
    onClose,
    title,
    formId,
    submitLabel = "Speichern",
    cancelLabel = "Abbrechen",
    size = "sm",
    error,
    children,
    formClassName = "grid gap-4",
}: FormModalProps) {
    const handleSubmit = (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>{title}</ModalDialog.Header>
            <ModalDialog.Content>
                {error}
                <form id={formId} onSubmit={handleSubmit} className={formClassName}>
                    {children}
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button type="button" variant="secondary" size={size} onClick={onClose}>
                    {cancelLabel}
                </Button>
                <form.Subscribe
                    selector={(state) => [state.canSubmit, state.isSubmitting]}
                    children={([canSubmit, isSubmitting]) => (
                        <Button
                            type="submit"
                            form={formId}
                            size={size}
                            disabled={!canSubmit}
                            loading={isSubmitting}
                        >
                            {submitLabel}
                        </Button>
                    )}
                />
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
