import {  clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type {ClassValue} from 'clsx';

export function cn(...inputs: Array<ClassValue>) {
    return twMerge(clsx(inputs));
}

export function getFormError(errors: Array<unknown>): string | undefined {
    return (errors[0] as { message?: string } | undefined)?.message;
}

export function getFormErrors(errors: Array<unknown>): string {
    return errors.map((e) => (e as { message?: string })?.message).filter(Boolean).join(" & ");
}