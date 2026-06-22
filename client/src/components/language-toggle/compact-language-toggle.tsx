import {Globe} from 'lucide-react';
import type {LanguageToggleProps} from './language-toggle-types';
import {cn} from '@/lib/utils';
import type {ComponentSize} from '@/components/size';

const COMPACT_SIZE_STYLES: Record<ComponentSize, string> = {
  xs: 'px-2 py-[4px] text-xs',
  sm: 'px-[12px] py-[6px] text-xs',
  md: 'px-[16px] py-[9px] text-sm',
};

const COMPACT_GLOBE_SIZE: Record<ComponentSize, number> = {
  xs: 12,
  sm: 15,
  md: 17,
};

/**
 * Compact toggle showing short language codes (DE / EN) behind a globe icon.
 * Best for tight spaces such as headers or footers.
 */
export const CompactLanguageToggle = ({
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
            className={cn(
                'inline-flex items-center overflow-hidden rounded-md border border-(--border) bg-white',
                className,
            )}
        >
            <span className="flex items-center self-stretch border-r border-(--border) pr-2 pl-[10px] text-(--fg-3)">
                <Globe size={COMPACT_GLOBE_SIZE[size]}/>
            </span>
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
                            `${COMPACT_SIZE_STYLES[size]} font-semibold tracking-wide transition-colors`,
                            active
                                ? 'bg-(--primary) text-white'
                                : 'text-(--fg-3) hover:bg-(--page-bg) hover:text-(--text-600)',
                        )}
                    >
                        {o.short ?? o.code.toUpperCase()}
                    </button>
                );
            })}
        </div>
    );
};

CompactLanguageToggle.displayName = 'CompactLanguageToggle';
