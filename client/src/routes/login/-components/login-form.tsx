import { useEffect, useState } from "react";

import useLoginForm from "../-hooks/use-login-form";
import { authClient } from "@/lib/auth-client";
import Input from "@/components/input";

export function LoginFormComponent() {
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const supportsConditional =
            typeof PublicKeyCredential !== "undefined" &&
            typeof PublicKeyCredential.isConditionalMediationAvailable === "function";
        if (!supportsConditional) return;

        PublicKeyCredential.isConditionalMediationAvailable().then((available) => {
            if (!available) return;
            void authClient.signIn.passkey({ autoFill: true });
        });
    }, []);

    const {
        form,
        handleSubmit,
        handlePasskeySignIn,
        passkeyLoading,
        rememberMe,
        setRememberMe,
        error
    } = useLoginForm();

    return (
        <div className="absolute min-w-screen min-h-screen flex items-center justify-center p-4">
            <div className="w-full max-w-sm">
                <div className="bg-white border border-(--border) rounded-md shadow-[0_4px_12px_rgba(0,0,0,0.08)] px-7 py-8">

                    {/* Heading */}
                    <div className="text-center mb-6">
                        <h1 className="font-medium text-xl text-gray-900 tracking-tight">
                            Anmelden
                        </h1>
                        <p className="text-sm text-gray-400 mt-1">Willkommen zurück</p>
                    </div>

                    <Input prefix={<p className="font-medium text-sm">AG</p>} />
                    <br />
                    <Input size="sm" prefix={<p className="font-medium text-sm">AG</p>} />

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Error banner */}
                        {error && (
                            <div
                                className="flex items-start gap-2 px-3 py-2.5 rounded-md bg-red-50 border border-red-200">
                                <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    className="text-red-500 shrink-0 mt-0.5"
                                >
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        {/* Email */}
                        <form.Field name="email">
                            {(field) => (
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor={field.name}
                                        className="text-sm font-medium text-gray-900"
                                    >
                                        E-Mail
                                    </label>
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        type="email"
                                        autoComplete="username webauthn"
                                        placeholder="du@firma.de"
                                        className={
                                            field.state.meta.isTouched &&
                                                field.state.meta.errors.length > 0
                                                ? "border-red-400!"
                                                : ""
                                        }
                                    />
                                    {field.state.meta.isTouched && field.state.meta.errors[0] && (
                                        <span className="text-xs text-red-500">
                                        </span>
                                    )}
                                </div>
                            )}
                        </form.Field>

                        {/* Password */}
                        <form.Field name="password">
                            {(field) => (
                                <div className="flex flex-col gap-1.5">
                                    <label
                                        htmlFor={field.name}
                                        className="text-sm font-medium text-gray-900"
                                    >
                                        Passwort
                                    </label>
                                    <input
                                        id={field.name}
                                        name={field.name}
                                        value={field.state.value}
                                        onChange={(e) => field.handleChange(e.target.value)}
                                        onBlur={field.handleBlur}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="current-password webauthn"
                                        placeholder="••••••••"
                                        className={
                                            field.state.meta.isTouched && field.state.meta.errors.length > 0
                                                ? "border-red-400!"
                                                : ""
                                        }

                                    />
                                    {field.state.meta.isTouched && field.state.meta.errors[0] && (
                                        <span className="text-xs text-red-500">
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
                                    aria-checked={rememberMe}
                                    onClick={() => setRememberMe((v) => !v)}
                                    className={`w-4 h-4 rounded flex items-center justify-center shrink-0 transition-all cursor-pointer border ${rememberMe ? "bg-(--primary-600) border-(--primary-600)" : "bg-white border-gray-300"}`}
                                >
                                    {rememberMe && (
                                        <svg
                                            width="9"
                                            height="9"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="white"
                                            strokeWidth="3.5"
                                            strokeLinecap="round"
                                        >
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                    )}
                                </div>
                                Angemeldet bleiben
                            </label>
                            <a
                                href="#"
                                className="text-sm text-(--primary-600) hover:underline"
                            >
                                Passwort vergessen?
                            </a>
                        </div>

                        {/* Submit */}
                        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                            {([canSubmit, isSubmitting]) => (
                                <button
                                    type="submit"
                                    disabled={!canSubmit}
                                    className="w-full mt-1"
                                >
                                    {!(isSubmitting) && "Anmelden"}
                                </button>
                            )}
                        </form.Subscribe>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-3 my-3">
                        <div className="h-px flex-1 bg-(--border)" />
                        <span className="text-xs text-gray-400">oder</span>
                        <div className="h-px flex-1 bg-(--border)" />
                    </div>

                    {/* Passkey sign-in */}
                    <button
                        type="button"
                        disabled={passkeyLoading}
                        onClick={handlePasskeySignIn}
                        className="w-full"
                    >
                        {!passkeyLoading && "Mit Passkey anmelden"}
                    </button>
                </div>
            </div>
        </div>
    );
}
