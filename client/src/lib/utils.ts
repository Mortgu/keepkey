import type { ClassValue } from 'clsx';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: Array<ClassValue>) {
    return twMerge(clsx(inputs));
}

export function getFormError(errors: Array<unknown>): string | undefined {
    return (errors[0] as { message?: string } | undefined)?.message;
}

export function getFormErrors(errors: Array<unknown>): string {
    return errors.map((e) => (e as { message?: string })?.message).filter(Boolean).join(" & ");
}

export function formatBytesToMB(bytes: number): string {
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
}

export function formatBytesToKB(bytes: number): string {
    return `${(bytes / 1024).toFixed(1)} KB`;
}

export function formatQueryString(obj: Record<string, any>): string {
    const params = new URLSearchParams();
    for (const [key, value] of Object.entries(obj)) {
        if (value !== undefined && value !== null) {
            params.append(key, String(value));
        }
    }
    return params.toString();
}