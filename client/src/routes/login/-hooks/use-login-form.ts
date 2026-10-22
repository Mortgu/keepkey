import { useForm } from "@tanstack/react-form";
import { loginSchema } from "@keepit/schemas";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";

export default function useLoginForm() {
    const [error, setError] = useState<string | undefined>(undefined);
    const [rememberMe, setRememberMe] = useState(false);

    const form = useForm({
        defaultValues: {
            email: "",
            password: "",
        },
        validators: {
            onChange: loginSchema,
        },
        onSubmit: async ({ value }) => {
            const result = await authClient.signIn.email({
                ...value, rememberMe,
            });

            if (result.error) {
                setError(result.error.message);
                return null;
            }

            window.location.assign('/');
            return result.data;
        }
    });

    const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
        event.preventDefault();
        event.stopPropagation();

        form.handleSubmit();
    }

    return {
        form,

        handleSubmit,

        rememberMe,
        setRememberMe,

        error,
        setError,
    }
}