/* ──────────────────────────────────────────────────────────────────────
   Nur Styles, keine Komponenten — react-refresh verlangt, dass ein Modul
   ausschließlich React-Komponenten exportiert (vgl. ehem. table-styles.ts).
   ────────────────────────────────────────────────────────────────────── */

import { tv } from "tailwind-variants";

/**
 * Slots für die Segmented-/Pill-Variante auf base-ui-Tabs — die zweite
 * Tab-Optik des Designs (die Komponente oben ist die Underline-Variante).
 * Beim Zusammenführen zu einem Wrapper werden daraus zwei `variant`-Werte.
 */
export const segmentedTabStyles = tv({
    slots: {
        Root: 'box-border w-fit max-w-xs grid gap-4',
        List: 'flex relative gap-0 bg-(--fg-2) p-1 rounded-md',
        Tab: [
            'flex items-center justify-center h-[calc(2rem_+_1px)] px-4 m-0 text-(--text-inv) border-0',
            'focus-visible:-outline-offset-1 focus-visible:outline-(--text-inv)',
            'text-sm select-none whitespace-nowrap break-keep rounded-sm',
            'data-active:text-(--text) data-active:bg-white',
        ],
        PanelViewport: 'grid grid-cols-[minmax(0,1fr)] w-full min-h-[8rem] bg-(--page-bg) rounded-md',
        Panel: 'flex items-center justify-center w-full text-sm',
    }
});
