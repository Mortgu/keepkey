import type {LanguageToggleProps} from './language-toggle-types';
import {cn} from '@/lib/utils';
import type {ComponentSize} from '@/components/size';

const UNDERLINE_SIZE_STYLES: Record<ComponentSize, string> = {
  xs: 'px-3 pt-1.5 pb-1 text-xs',
  sm: 'px-[14px] pt-2 pb-[10px] text-sm',
  md: 'px-[18px] pt-2.5 pb-[12px] text-md',
};

/**
 * Underline tabs that grow an accent bar beneath the active option.
 * Blends naturally into tabbed or settings-style layouts.
 */
export const UnderlineLanguageToggle = ({
                                            options,
                                            value,
                                            onChange,
                                            className,
                                            size = 'sm',
                                            'aria-label': ariaLabel = 'Language',
                                        }: LanguageToggleProps) => {
    return (
        <div
            role="tablist"
            aria-label={ariaLabel}
            className={cn('inline-flex gap-1 border-b border-(--border)', className)}
        >
            {options.map((o) => {
                const active = o.code === value;
                return (
                    <button
                        key={o.code}
                        type="button"
                        role="tab"
                        aria-selected={active}
                        onClick={() => onChange(o.code)}
                        className={cn(
                            `relative font-medium transition-colors ${UNDERLINE_SIZE_STYLES[size]}`,
                            'after:absolute after:right-[8px] after:bottom-[-1px] after:left-[8px] after:h-[2px] after:rounded-t after:bg-(--primary) after:transition-transform after:duration-200 after:ease-out',
                            active
                                ? 'font-semibold text-(--primary) after:scale-x-100'
                                : 'text-(--fg-3) after:scale-x-0 hover:text-(--text-600)',
                        )}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
};

UnderlineLanguageToggle.displayName = 'UnderlineLanguageToggle';
