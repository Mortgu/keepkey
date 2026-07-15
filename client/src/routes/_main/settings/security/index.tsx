import {createFileRoute} from "@tanstack/react-router";

import PasskeyForm from "@/routes/_main/settings/-components/passkey-form.tsx";
import PasswordForm from "@/routes/_main/settings/-components/password-form.tsx";

export const Route = createFileRoute("/_main/settings/security/")({
    component: () => (
        <div className="grid gap-4">
            <PasswordForm />
            <PasskeyForm />
        </div>
    ),
});