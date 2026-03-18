import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function wait() {
    const delay = 1000;
    return new Promise((resolve) => setTimeout(resolve, delay));
}