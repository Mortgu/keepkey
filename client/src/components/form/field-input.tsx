import { Input } from "../input";
import { Textarea } from "../textarea";
import { Select } from "../select";
import { NumberField } from "../number-field";
import type { InputComponentProps } from "../input";
import type { TextareaComponentProps } from "../textarea";
import type { SelectComponentProps } from "../select";
import type { NumberFieldComponentProps } from "../number-field";
import type { ChangeEvent } from "react";
import { getFormError } from "@/lib/utils";

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

export interface FieldSelectProps<TValue = string>
    extends Omit<SelectComponentProps, "value" | "onChange" | "onBlur" | "id" | "error"> {
    field: BindableField<TValue>;
    onChange?: (e: ChangeEvent<HTMLSelectElement>, field: BindableField<TValue>) => void;
}

export function FieldSelect<TValue = string>({
    field,
    onChange,
    ...rest
}: FieldSelectProps<TValue>) {
    return (
        <Select
            id={field.name}
            value={(field.state.value ?? "") as SelectComponentProps["value"]}
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
