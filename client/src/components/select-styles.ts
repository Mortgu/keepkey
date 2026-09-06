/* ──────────────────────────────────────────────────────────────────────
   Nur Styles, keine Komponenten — react-refresh verlangt, dass ein Modul
   ausschließlich React-Komponenten exportiert (vgl. dialog-styles.ts).
   ────────────────────────────────────────────────────────────────────── */

import { tv } from "tailwind-variants";
import { FIELD_BASE, FIELD_FOCUS, FIELD_SIZE, FIELD_STATE } from "./tokens";

/**
 * Slots für einen base-ui-Select: Trigger → Portal → Positioner → Popup → List → Item.
 *
 * Der `Trigger` erbt Rahmen, Höhe, Fokus und Zustandsfarben aus `tokens.ts` — nur
 * so steht der Select bündig neben Input, NumberField und Button (siehe
 * `/dev/components`). Wer einen eigenen Trigger mitbringt (die Filter-Dropdowns),
 * überspringt den Slot und nutzt `buttonStyles`.
 *
 * Popup/Positioner liegen im Portal. Stapelebenen im Projekt: Drawer 40/50,
 * Dialog 100, Select 110 — das Select-Popup muss über dem Dialog liegen, in dem
 * es steht, sonst verschwindet es hinter dessen Backdrop.
 */
export const selectStyles = tv({
    slots: {
        Trigger: [
            FIELD_BASE,
            FIELD_FOCUS,
            'flex items-center justify-between gap-2 cursor-pointer text-left',
            'data-disabled:bg-(--subtle-50) data-disabled:text-(--text-secondary) data-disabled:cursor-not-allowed',
        ],
        Value: 'truncate',
        Placeholder: 'truncate text-(--text-secondary)',
        Icon: 'shrink-0 flex items-center text-(--text-secondary) transition-transform duration-150 data-popup-open:rotate-180',
        Positioner: 'z-110 outline-none',
        Popup: [
            'max-h-(--available-height) min-w-(--anchor-width) overflow-y-auto scrollbar-none',
            'border border-(--border) bg-white rounded-md p-1',
            'shadow-(--shadow-popover) origin-(--transform-origin)',
            'transition-[transform,opacity] duration-150',
            'data-starting-style:opacity-0 data-starting-style:scale-98',
            'data-ending-style:opacity-0 data-ending-style:scale-98',
        ],
        List: 'outline-none',
        Item: [
            'grid grid-cols-[1rem_1fr] items-center gap-2 py-2 px-2 rounded-sm text-sm',
            'cursor-pointer select-none outline-none text-(--text)',
            'data-highlighted:bg-(--page-bg)',
            'data-selected:bg-(--primary-50)',
            'data-disabled:opacity-50 data-disabled:cursor-not-allowed',
            'data-selected:text-(--success) not:data-selected:text-(--text-secondary)'
        ],
        ItemIndicator: 'col-start-1 flex items-center justify-center text-(--primary)',
        ItemText: 'col-start-2 truncate',
        Separator: 'my-1 h-px bg-(--border)',
        /** Fußzeile im Popup, z.B. „Auswahl zurücksetzen". */
        Footer: 'px-2 py-1.5',
    },
    variants: {
        size: {
            xs: { Trigger: FIELD_SIZE.xs },
            sm: { Trigger: FIELD_SIZE.sm },
            md: { Trigger: FIELD_SIZE.md },
        },
        state: {
            none: { Trigger: FIELD_STATE.none },
            error: { Trigger: FIELD_STATE.error },
            warning: { Trigger: FIELD_STATE.warning },
        },
    },
    defaultVariants: {
        size: "sm",
        state: "none",
    },
});
