import { useForm } from "@tanstack/react-form";
import { loginSchema } from "@keepit/schemas";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function useLoginForm() {
    const [error, setError] = useState<string | undefined>(undefined);
    const [rememberMe, setRememberMe] = useState(false);
    const [passkeyLoading, setPasskeyLoading] = useState(false);

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        validators: {
            onChange: loginSchema,
        },
        onSubmit: async ({ value }) => {
            const { data, error: signInError } = await authClient.signIn.email({
                ...value, rememberMe,
            });

            if (signInError) {
                setError(signInError.message);
                return null;
            }

            window.location.assign('/');
            return data;
        }
    });

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    const handlePasskeySignIn = async () => {
        setPasskeyLoading(true);
        setError(undefined);

        const { error: passkeyError } = await authClient.signIn.passkey({
            fetchOptions: {
                onSuccess: () => {
                    setPasskeyLoading(false);
                    window.location.assign('/');
                },
                onError: (context) => {
                    setPasskeyLoading(false);
                    setError(context.error.message);
                }
            }
        });

        if (passkeyError) {
            setError(passkeyError.message ?? 'Passkey sign in failed!');
        }

        setError(undefined);
        setPasskeyLoading(false);
    }

    return {
        form,

        handleSubmit,
        handlePasskeySignIn,

        passkeyLoading,

        rememberMe,
        setRememberMe,

        error,
        setError,
    }
}