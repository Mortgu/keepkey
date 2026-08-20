/* ──────────────────────────────────────────────────────────────────────
   Nur Styles, keine Komponenten — react-refresh verlangt, dass ein Modul
   ausschließlich React-Komponenten exportiert (vgl. ehem. table-styles.ts).
   ────────────────────────────────────────────────────────────────────── */

import { tv } from "tailwind-variants";

/**
 * Slots für einen base-ui-Dialog: Portal → Backdrop → Viewport → Popup,
 * darin Header / Body (scrollbar) / Actions.
 *
 * Vorerst nur die Styles — die Call-Sites setzen die Anatomie noch selbst
 * zusammen. Der Compound-Wrapper, der das Boilerplate übernimmt, kommt hier
 * dazu und löst dann `modal.tsx` ab.
 */
export const dialogStyles = tv({
    slots: {
        Backdrop: 'fixed bg-white/25 backdrop-blur-xs transition-opacity duration inset-0',
        Viewport: 'fixed flex items-center justify-center overflow-hidden px-0 py-6 inset-0',
        ScrollView: 'box-border h-full overscroll-contain',
        ScrollContent: 'flex items-center justify-center min-h-full',
        Scrollbar: 'flex justify-center bg-black w-4 opacity-0 transition-opacity duration pointer-events-none z-100',
        ScrollbarThumb: 'w-full bg-(--destructive) z-101',
        Popup: [
            'relative flex flex-col w-[min(50rem,calc(100vw_-_2rem))] max-h-full max-w-full border border-(--border) min-h-0 bg-white',
            'rounded-md data-nested-dialog-open:scale-96',
            'transition-all '
        ],
        Header: 'flex items-center justify-between gap-1 p-4 border-b border-(--border)',
        Title: 'text-base leading-6 font-medium m-0',
        Description: 'flex items-center text-sm leading-5 text-(--text) m-0',
        Body: 'relative flex-auto flex min-h-0 overflow-hidden',
        BodyViewport: 'box-border flex-auto min-h-0 overscroll-contain',
        BodyContent: 'flex flex-col p-4',
        Section: 'box-border flex flex-col gap-1 p-4',
        SectionTitle: 'text-sm leaning-5 font-bold m-0',
        SectionBody: 'text-sm leading-5',
        Actions: 'flex justify-end gap-3 p-4 border-t border-(--border)',
    }
});
