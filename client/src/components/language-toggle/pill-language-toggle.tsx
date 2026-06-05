import {Check} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {LanguageToggleProps} from './language-toggle-types';

/**
 * Fully labelled pill toggle with a checkmark and a short-code badge on the
 * active option. The most explicit / accessible of the variants.
 */
export const PillLanguageToggle = ({
                                       options,
                                       value,
                                       onChange,
                                       className,
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
                            'inline-flex items-center gap-[7px] rounded-full border py-[6px] pr-[14px] pl-[12px] text-sm font-medium transition-all',
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
                            <Check size={14} strokeWidth={2.6}/>
                        </span>
                        {o.label}
                        <span
                            className={cn(
                                'rounded px-[5px] py-px text-[10px] font-semibold tracking-wide',
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
