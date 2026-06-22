import {Check} from 'lucide-react';
import type {LanguageToggleProps} from './language-toggle-types';
import {cn} from '@/lib/utils';
import type {ComponentSize} from '@/components/size';

const PILL_SIZE_STYLES: Record<ComponentSize, string> = {
  xs: 'py-[4px] pr-3 pl-[10px] gap-[5px] text-xs',
  sm: 'py-[6px] pr-[14px] pl-[12px] gap-[7px] text-sm',
  md: 'py-[9px] pr-[18px] pl-[14px] gap-[9px] text-md',
};

const PILL_CHECK_SIZE: Record<ComponentSize, number> = {
  xs: 12,
  sm: 14,
  md: 16,
};

const PILL_BADGE_STYLES: Record<ComponentSize, string> = {
  xs: 'px-[4px] py-px text-[9px]',
  sm: 'px-[5px] py-px text-[10px]',
  md: 'px-[6px] py-0.5 text-[11px]',
};

/**
 * Fully labelled pill toggle with a checkmark and a short-code badge on the
 * active option. The most explicit / accessible of the variants.
 */
export const PillLanguageToggle = ({
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
            className={cn('inline-flex gap-[6px]', className)}
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
                            `inline-flex items-center rounded-full border font-medium transition-all ${PILL_SIZE_STYLES[size]}`,
                            active
                                ? 'border-(--primary) bg-(--primary-50) font-semibold text-(--primary)'
                                : 'border-(--border) bg-white text-(--fg-2) hover:border-(--border-200) hover:bg-(--page-bg)',
                        )}
                    >
                        <span
                            className={cn(
                                'flex transition-opacity',
                                active ? 'opacity-100' : 'opacity-0',
                            )}
                        >
                            <Check size={PILL_CHECK_SIZE[size]} strokeWidth={2.6}/>
                        </span>
                        {o.label}
                        <span
                            className={cn(
                                `rounded font-semibold tracking-wide ${PILL_BADGE_STYLES[size]}`,
                                active ? 'bg-(--primary-100) text-(--primary)' : 'bg-(--subtle-50) text-(--fg-3)',
                            )}
                        >
                            {o.short ?? o.code.toUpperCase()}
                        </span>
                    </button>
                );
            })}
        </div>
    );
};

PillLanguageToggle.displayName = 'PillLanguageToggle';
