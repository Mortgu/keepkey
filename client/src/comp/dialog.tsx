import { tv } from "tailwind-variants";

export const dialogStyles = tv({
    slots: {
        backdrop: 'fixed inset-0 bg-white/50 backdrop-blur-xs z-50 flex items-center justify-center',
        popup: [
            'fixed top-1/2 left-1/2 grid w-full max-w-4xl -translate-x-1/2 -translate-y-1/2',
            'z-100 border border-(--border) rounded-md bg-white',
            'data-nested-dialog-open:opacity-0'
        ],
        header: [
            'flex items-center justify-between p-4 border-b border-(--border)'
        ],
        title: 'text-md',
        description: 'text-sm',
        filters: 'p-4 border-b border-(--border) flex items-center justify-start gap-4',
        body: ['p-4'],
        footer: 'flex items-center justify-end gap-4 p-4 border-t border-(--border)'
    }
})