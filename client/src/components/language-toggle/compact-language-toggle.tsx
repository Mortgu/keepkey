import {Globe} from 'lucide-react';
import {cn} from '@/lib/utils';
import type {LanguageToggleProps} from './language-toggle-types';

/**
 * Compact toggle showing short language codes (DE / EN) behind a globe icon.
 * Best for tight spaces such as headers or footers.
 */
export const CompactLanguageToggle = ({
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
            className={cn(
                'inline-flex items-center overflow-hidden rounded-md border border-(--border) bg-white',
                className,
            )}
        >
            <span className="flex items-center self-stretch border-r border-(--border) pr-2 pl-[10px] text-(--fg-3)">
                <Globe size={15}/>
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
                            'px-[12px] py-[6px] text-xs font-semibold tracking-wide transition-colors',
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
