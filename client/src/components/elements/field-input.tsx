import type {
    InputComponentProps,
    NumberFieldComponentProps,
    SelectComponentProps,
    TextareaComponentProps
} from "@/components";
import { Input, NumberField, Select, Textarea } from "@/components";
import { getFormError } from "@/lib/utils";
import { Check, Eye, EyeOff } from "lucide-react";
import type { ChangeEvent } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

/* ──────────────────────────────────────────────────────────────────────
   A `BindableField` is the structural slice of TanStack Form's `FieldApi`
   that the <FieldInput>/<FieldTextarea>/<FieldSelect> helpers need. It is
   kept intentionally minimal and structurally compatible so the real field
   object from a `form.Field` render prop is assignable without forcing the
   helper to thread TanStack's full generic parameter list.
   ────────────────────────────────────────────────────────────────────── */

export interface BindableField<TValue> {
    name: string;
    state: {
        value: TValue;
        meta: { errors: Array<unknown> };
    };
    handleChange: (value: TValue) => void;
    handleBlur: () => void;
}

/* ── Input ──────────────────────────────────────────────────────────── */

export interface FieldInputProps<TValue = string>
    extends Omit<InputComponentProps, "value" | "onChange" | "onBlur" | "id" | "error"> {
    field: BindableField<TValue>;
    onChange?: (e: ChangeEvent<HTMLInputElement>, field: BindableField<TValue>) => void;
}

export function FieldInput<TValue = string>({
    field,
    onChange,
    ...rest
}: FieldInputProps<TValue>) {
    return (
        <Input
            id={field.name}
            value={(field.state.value ?? "") as InputComponentProps["value"]}
            error={getFormError(field.state.meta.errors)}
            onBlur={field.handleBlur}
            onChange={
                onChange
                    ? (e) => onChange(e, field)
                    : (e) => field.handleChange(e.target.value as TValue)
            }
            {...rest}
        />
    );
}

/* ── Password ───────────────────────────────────────────────────────── */

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/**
 * Wie {@link FieldInput}, mit Augen-Symbol zum Ein-/Ausblenden des Passworts.
 * Mit `showRequirements` steht darunter, was das Passwort erfüllen muss.
 */
export function FieldPasswordInput<TValue = string>({
    showRequirements = false,
    ...props
}: Omit<FieldInputProps<TValue>, "type" | "rightButton"> & { showRequirements?: boolean }) {
    const { t } = useTranslation();
    const [visible, setVisible] = useState(false);
    const length = String(props.field.state.value ?? "").length;
    const met = length >= PASSWORD_MIN_LENGTH && length <= PASSWORD_MAX_LENGTH;

    return (
        <div className="grid gap-1.5">
            <FieldInput
                {...props}
                type={visible ? "text" : "password"}
                rightButton={{
                    variant: "ghost",
                    onClick: () => setVisible((v) => !v),
                    "aria-label": visible ? t("login.hidePassword") : t("login.showPassword"),
                    icon: visible ? <EyeOff size={15} /> : <Eye size={15} />,
                }}
            />
            {showRequirements && (
                <p className={`flex items-center gap-1.5 text-xs ${met ? "text-green-600" : "text-(--text-secondary)"}`}>
                    <Check size={12} className={met ? "" : "opacity-30"} />
                    {t("login.passwordRequirement", { min: PASSWORD_MIN_LENGTH, max: PASSWORD_MAX_LENGTH })}
                </p>
            )}
        </div>
    );
}

/* ── Textarea ───────────────────────────────────────────────────────── */

export interface FieldTextareaProps<TValue = string>
    extends Omit<TextareaComponentProps, "value" | "onChange" | "onBlur" | "id" | "error"> {
    field: BindableField<TValue>;
    onChange?: (e: ChangeEvent<HTMLTextAreaElement>, field: BindableField<TValue>) => void;
}

export function FieldTextarea<TValue = string>({
    field,
    onChange,
    ...rest
}: FieldTextareaProps<TValue>) {
    return (
        <Textarea
            id={field.name}
            value={(field.state.value ?? "") as TextareaComponentProps["value"]}
            error={getFormError(field.state.meta.errors)}
            onBlur={field.handleBlur}
            onChange={
                onChange
                    ? (e) => onChange(e, field)
                    : (e) => field.handleChange(e.target.value as TValue)
            }
            {...rest}
        />
    );
}

/* ── Number ─────────────────────────────────────────────────────────── */

export interface FieldNumberProps<TValue = number | null>
    extends Omit<NumberFieldComponentProps, "value" | "onValueChange" | "onBlur" | "id" | "error"> {
    field: BindableField<TValue>;
    onValueChange?: (value: number | null, field: BindableField<TValue>) => void;
}

export function FieldNumber<TValue = number | null>({
    field,
    onValueChange,
    ...rest
}: FieldNumberProps<TValue>) {
    return (
        <NumberField
            id={field.name}
            name={field.name}
            value={(field.state.value ?? null) as number | null}
            error={getFormError(field.state.meta.errors)}
            onBlur={field.handleBlur}
            onValueChange={
                onValueChange
                    ? (value) => onValueChange(value, field)
                    : (value) => field.handleChange(value as TValue)
            }
            {...rest}
        />
    );
}

/* ── Select ─────────────────────────────────────────────────────────── */

/* Die Optionen bleiben absichtlich `string`-basiert: TanStacks Feldwert ist ein
   `Updater<…>`-Union, mit dem sich die Options-Arrays der Call-Sites nicht
   decken. Der Wert wird beim Setzen auf TValue gecastet — wie zuvor auch. */
export interface FieldSelectProps<TValue = string>
    extends Omit<SelectComponentProps<string>, "value" | "onValueChange" | "onBlur" | "id" | "error"> {
    field: BindableField<TValue>;
    /** Überschreibt das Setzen des Feldwerts — bekommt den neuen Wert, nicht ein Event. */
    onValueChange?: (value: string, field: BindableField<TValue>) => void;
}

export function FieldSelect<TValue = string>({
    field,
    onValueChange,
    ...rest
}: FieldSelectProps<TValue>) {
    return (
        <Select
            id={field.name}
            value={(field.state.value ?? null) as string | null}
            error={getFormError(field.state.meta.errors)}
            onBlur={field.handleBlur}
            onValueChange={
                onValueChange
                    ? (value) => onValueChange(value, field)
                    : (value) => field.handleChange(value as TValue)
            }
            {...rest}
        />
    );
}
