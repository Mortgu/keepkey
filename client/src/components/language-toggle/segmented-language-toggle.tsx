import {cn} from '@/lib/utils';
import type {LanguageToggleProps} from './language-toggle-types';

/**
 * Segmented control with a sliding white thumb behind the active option.
 * Scales to any number of options.
 */
export const SegmentedLanguageToggle = ({
                                            options,
                                            value,
                                            onChange,
                                            className,
                                            'aria-label': ariaLabel = 'Language',
                                        }: LanguageToggleProps) => {
    const activeIndex = Math.max(0, options.findIndex((o) => o.code === value));

    return (
        <div
            role="tablist"
            aria-label={ariaLabel}
            className={cn(
                'relative inline-flex rounded-md border border-(--border) bg-(--subtle-50) p-[3px]',
                className,
            )}
        >
            <span
                aria-hidden
                className="absolute top-[3px] bottom-[3px] left-[3px] rounded bg-white shadow-sm transition-transform duration-200 ease-[cubic-bezier(0.4,0,0.2,1)]"
                style={{
                    width: `calc((100% - 6px) / ${options.length})`,
                    transform: `translateX(${activeIndex * 100}%)`,
                }}
            />
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
                            'relative z-10 min-w-[56px] flex-1 rounded px-[16px] py-[5px] text-sm font-medium transition-colors',
                            active ? 'font-semibold text-(--primary)' : 'text-(--text-600) hover:text-(--text)',
                        )}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
};

SegmentedLanguageToggle.displayName = 'SegmentedLanguageToggle';
