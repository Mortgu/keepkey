import { Select as BaseSelect } from "@base-ui/react";
import { Check, ChevronDown } from "lucide-react";
import { Field } from "./field";
import { selectStyles } from "./select-styles";
import { fieldState } from "./tokens";
import type { ComponentSize } from "./tokens";
import type { ReactElement, ReactNode } from "react";

export interface SelectOption<TValue = string> {
    value: TValue;
    label: string;
}

export interface SelectComponentProps<TValue = string> {
    /** Aktuelle Auswahl. `null` = nichts gewählt. */
    value?: TValue | null;
    onValueChange?: (value: TValue) => void;
    defaultValue?: TValue | null;

    options: Array<SelectOption<TValue>>;

    /** Shown while no value is selected. */
    placeholder?: string;

    onBlur?: () => void;

    size?: ComponentSize;
    disabled?: boolean;
    name?: string;
    /** Identifiziert das Formular, wenn der Select außerhalb davon steht. */
    form?: string;
    id?: string;

    /** Optional label text rendered above the field. */
    label?: string;

    /** Short error label shown as a badge next to the field label. Turns the border red. */
    error?: string;

    /** Longer explanation shown in a tooltip when the error badge is hovered. */
    errorTooltip?: string;

    /** Short warning label shown as a badge next to the field label. Turns the border amber. */
    warning?: string;

    /** Longer explanation shown in a tooltip when the warning badge is hovered. */
    warningTooltip?: string;

    /**
     * Ersetzt den feldförmigen Trigger durch ein eigenes Element (via base-ui
     * `render`). Dann entfällt der `Field`-Rahmen — gedacht für Filterleisten,
     * die einen Button statt eines Eingabefelds zeigen.
     */
    trigger?: ReactElement;

    /** Zusätzlicher Inhalt am Ende des Popups, z.B. „Auswahl zurücksetzen". */
    popupFooter?: ReactNode;

    className?: string;
}

/**
 * Select auf Basis von base-ui. Kapselt Portal / Positioner / Popup, damit
 * Call-Sites nur `options` und `onValueChange` angeben.
 *
 * Anders als das frühere native `<select>` ist der Wert nicht auf `string`
 * festgelegt — `value` und `options[].value` folgen demselben Typ.
 */
export function Select<TValue = string>({
    value,
    onValueChange,
    defaultValue,
    options,
    placeholder,
    onBlur,
    size,
    disabled,
    name,
    form,
    id,
    label,
    error,
    errorTooltip,
    warning,
    warningTooltip,
    trigger,
    popupFooter,
    className,
}: SelectComponentProps<TValue>) {
    const styles = selectStyles({ size, state: fieldState(error, warning) });

    const control = (
        <BaseSelect.Root
            items={options as ReadonlyArray<{ label: ReactNode; value: unknown }>}
            value={value as never}
            defaultValue={defaultValue as never}
            onValueChange={(next) => onValueChange?.(next as TValue)}
            disabled={disabled}
            name={name}
            form={form}
            id={id}
        >
            {trigger ? (
                <BaseSelect.Trigger render={trigger} />
            ) : (
                <BaseSelect.Trigger className={styles.Trigger({ className })} onBlur={onBlur}>
                    <BaseSelect.Value className={styles.Value()}>
                        {(selected: TValue | null) => {
                            const match = options.find((o) => o.value === selected);
                            if (match) return match.label;
                            return <span className={styles.Placeholder()}>{placeholder}</span>;
                        }}
                    </BaseSelect.Value>
                    <BaseSelect.Icon className={styles.Icon()}>
                        <ChevronDown size={14} />
                    </BaseSelect.Icon>
                </BaseSelect.Trigger>
            )}

            <BaseSelect.Portal>
                <BaseSelect.Positioner
                    className={styles.Positioner()}
                    sideOffset={4}
                    /* false: normal verankert statt über dem Trigger — nur so setzt
                       base-ui --available-height, das das Popup auf Viewporthöhe deckelt. */
                    alignItemWithTrigger={false}
                >
                    <BaseSelect.Popup className={styles.Popup()}>
                        <BaseSelect.List className={styles.List()}>
                            {options.map((option) => (
                                <BaseSelect.Item
                                    key={String(option.value)}
                                    value={option.value}
                                    className={styles.Item()}
                                >
                                    <BaseSelect.ItemIndicator className={styles.ItemIndicator()}>
                                        <Check size={14} />
                                    </BaseSelect.ItemIndicator>
                                    <BaseSelect.ItemText className={styles.ItemText()}>
                                        {option.label}
                                    </BaseSelect.ItemText>
                                </BaseSelect.Item>
                            ))}
                        </BaseSelect.List>
                        {popupFooter}
                    </BaseSelect.Popup>
                </BaseSelect.Positioner>
            </BaseSelect.Portal>
        </BaseSelect.Root>
    );

    if (trigger) return control;

    return (
        <Field
            label={label}
            error={error}
            errorTooltip={errorTooltip}
            warning={warning}
            warningTooltip={warningTooltip}
            htmlFor={id}
        >
            {control}
        </Field>
    );
}
