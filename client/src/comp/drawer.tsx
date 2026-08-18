import { tv } from "tailwind-variants";

export const drawerStyles = tv({
    slots: {
        Backdrop: '[--backdrop-opacity:0.2] dark:[--backdrop-opacity:0.7] fixed inset-0 min-h-dvh bg-black opacity-[calc(var(--backdrop-opacity)*(1-var(--drawer-swipe-progress)))] transition-opacity duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)] data-swiping:duration-0 data-ending-style:opacity-0 data-starting-style:opacity-0 data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)] supports-[-webkit-touch-callout:none]:absolute',

        Viewport: '[--viewport-padding:0px] fixed inset-0 flex items-stretch justify-end',

        Popup: [
            '[--bleed:0px] [--peek:1rem] [--stack-step:0.05]',
            '[--stack-progress:clamp(0,var(--drawer-swipe-progress),1)]',
            '[--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))]',
            '[--stack-scale-base:calc(max(0,1-(var(--nested-drawers)*var(--stack-step))))]',
            '[--stack-scale:clamp(0,calc(var(--stack-scale-base)+(var(--stack-step)*var(--stack-progress))),1)]',
            'group/popup bg-white',
            'h-full w-[25rem] max-w-[calc(100vw-3rem)]',
            'shadow-[0.25rem_0.25rem_0] shadow-black/12 overflow-y-auto overscroll-contain touch-auto',
            '[transform-origin:calc(100%-var(--bleed))_50%]',
            '[transform:translateX(calc(var(--drawer-swipe-movement-x)-var(--stack-peek-offset)))_scale(var(--stack-scale))]',
            'transition-transform duration-[450ms] ease-[cubic-bezier(0.32,0.72,0,1)]',
            'data-swiping:select-none data-swiping:duration-0 data-nested-drawer-swiping:duration-0',
            'data-starting-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))]',
            'data-ending-style:[transform:translateX(calc(100%-var(--bleed)+var(--viewport-padding)+2px))]',
            'data-ending-style:duration-[calc(var(--drawer-swipe-strength)*400ms)]',
            '[--stack-peek-offset:max(0px,calc((var(--nested-drawers)-var(--stack-progress))*var(--peek)))]',
        ],

        Content: 'transition-opacity duration-[300ms] ease-[cubic-bezier(0.45,1.005,0,1.005)] group-data-nested-drawer-open/popup:opacity-0 group-data-nested-drawer-swiping/popup:opacity-100',

        Title: 'text-md font-medium',
    }
});