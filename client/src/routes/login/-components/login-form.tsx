import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { authClient } from "@/lib/auth-client.ts";
import { Eye, EyeOff } from "lucide-react";
import { z } from 'zod';
import { Route } from "../";

import { Input, Button } from "@/components";

export function LoginFormComponent() {
    const [error, setError] = useState<string | undefined>(undefined);
    const [showPassword, setShowPassword] = useState(false);
    const [remember, setRemember] = useState(false);
    const { redirect } = Route.useSearch();

    const form = useForm({
        defaultValues: {
            email: '',
            password: '',
        },
        validators: {
            onChange: z.object({
                email: z.email(),
                password: z.string().min(8),
            })
        },
        onSubmit: async ({ value }) => {
            setError(undefined);
            const { data, error } = await authClient.signIn.email({
                ...value, rememberMe: remember, callbackURL: redirect ? `${redirect}` : '/',
            });

            if (error) {
                setError(error.message);
                return null;
            }

            window.location.assign("/");
            return data;
        }
    });

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-white border border-(--border) rounded-xl shadow-[0_4px_12px_rgba(0,0,0,0.08)] px-7 py-8">

                    {/* Logo */}
                    <div className="flex items-center justify-center gap-2 mb-6">
                        <div className="w-8 h-8 bg-(--primary-600) rounded-lg flex items-center justify-center shrink-0">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                                <line x1="8" y1="13" x2="16" y2="13" />
                                <line x1="8" y1="17" x2="13" y2="17" />
                            </svg>
                        </div>
                        <span className="font-semibold text-[17px] text-gray-900 tracking-tight">keepit</span>
                    </div>

                    {/* Heading */}
                    <div className="text-center mb-6">
                        <h1 className="font-semibold text-lg text-gray-900 tracking-tight">Anmelden</h1>
                        <p className="text-sm text-gray-400 mt-1">Willkommen zurück</p>
                    </div>

                    <form
                        onSubmit={(e) => { e.preventDefault(); e.stopPropagation(); form.handleSubmit(); }}
                        className="flex flex-col gap-4"
                    >
                        {/* Error banner */}
                        {error && (
                            <div className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-red-500 shrink-0 mt-0.5">
                                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <form.Field name="email">
                            {(field) => (
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor={field.name} className="text-sm font-medium text-gray-900">E-Mail</label>
                                    <Input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        type="email"
                                        placeholder="du@firma.de"
                                        className={field.state.meta.isTouched && field.state.meta.errors.length > 0 ? 'border-red-400!' : ''}
                                    />
                                    {field.state.meta.isTouched && field.state.meta.errors[0] && (
                                        <span className="text-xs text-red-500">
                                            {(field.state.meta.errors[0] as { message?: string })?.message ?? String(field.state.meta.errors[0])}
                                        </span>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        {/* Password */}
                        <form.Field name="password">
                            {(field) => (
                                <div className="flex flex-col gap-1.5">
                                    <label htmlFor={field.name} className="text-sm font-medium text-gray-900">Passwort</label>
                                    <div className="relative">
                                        <Input
                                            id={field.name}
                                            name={field.name}
                                            value={field.state.value}
                                            onChange={(e) => field.handleChange(e.target.value)}
                                            onBlur={field.handleBlur}
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••"
                                            className={`pr-10 ${field.state.meta.isTouched && field.state.meta.errors.length > 0 ? 'border-red-400!' : ''}`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(v => !v)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                        >
                                            {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                                        </button>
                                    </div>
                                    {field.state.meta.isTouched && field.state.meta.errors[0] && (
                                        <span className="text-xs text-red-500">
                                            {(field.state.meta.errors[0] as { message?: string })?.message ?? String(field.state.meta.errors[0])}
                                        </span>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        {/* Remember me + Forgot password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer select-none text-sm text-gray-600">
                                <div
                                    role="checkbox"
                                    aria-checked={remember}
                                    onClick={() => setRemember(v => !v)}
                                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all cursor-pointer border ${remember ? 'bg-(--primary-600) border-(--primary-600)' : 'bg-white border-gray-300'}`}
                                >
                                    {remember && (
                                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                Angemeldet bleiben
                            </label>
                            <a href="#" className="text-sm text-(--primary-600) hover:underline">
                                Passwort vergessen?
                            </a>
                        </div>

                        {/* Submit */}
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                            {([canSubmit, isSubmitting]) => (
                                <Button
                                    type="submit"
                                    disabled={!canSubmit}
                                    loading={isSubmitting as boolean}
                                    className="w-full mt-1"
                                >
                                    {!(isSubmitting as boolean) && 'Anmelden'}
                                </Button>
                            )}
                        </form.Subscribe>
                    </form>
                </div>
            </div>
        </div>
    );
}
