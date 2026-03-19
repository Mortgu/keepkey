import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useSession } from './auth-client';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function wait() {
    const delay = 1000;
    return new Promise((resolve) => setTimeout(resolve, delay));
}

export function User() {
}