/* ──────────────────────────────────────────────────────────────────────
   Nur Styles, keine Komponenten — react-refresh verlangt, dass ein Modul
   ausschließlich React-Komponenten exportiert (vgl. ehem. table-styles.ts).
   ────────────────────────────────────────────────────────────────────── */

import { tv } from "tailwind-variants";

/** Slots für ein base-ui-Menu (Trigger → Positioner → Popup → Item). */
export const menuStyles = tv({
    slots: {
        Trigger: 'outline-(--border) rounded-md data-popup-open:bg-(--page-bg) data-popup-open:outline',
        Positioner: '',
        Popup: 'border border-(--border) bg-white right-0 mt-2 rounded-md p-1',
        Item: [
            'w-full flex items-center justify-start gap-2 py-2 px-3 rounded-sm text-sm',
            'cursor-pointer hover:bg-(--page-bg)',
            'data-danger:text-(--destructive) data-danger:hover:bg-(--destructive-subtle)',
            'data-disabled:opacity-50'
        ]
    }
});
