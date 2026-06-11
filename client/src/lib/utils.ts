import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getFormError(errors: unknown[]): string | undefined {
    return (errors[0] as { message?: string } | undefined)?.message;
}

export function getFormErrors(errors: unknown[]): string {
    return errors.map((e) => (e as { message?: string })?.message).filter(Boolean).join(" & ");
}