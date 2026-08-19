import { tv } from "tailwind-variants";

export const menuStyles = tv({
    slots: {
        Trigger: 'outline-(--border) rounded-md  data-popup-open:bg-(--page-bg) data-popup-open:outline',
        Positioner: '',
        Popup: 'border border-(--border) bg-white right-0 mt-2 rounded-md p-1',
        Item: [
            'w-full flex items-center justify-start gap-2 py-2 px-3 rounded-sm text-sm',
            'cursor-pointer hover:bg-(--page-bg)',
            'data-danger:text-red-500 data-danger:hover:bg-red-50',
            'data-disabled:opacity-50'
        ]
    }
})