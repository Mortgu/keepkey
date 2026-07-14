import {createFileRoute} from "@tanstack/react-router";

import EmailForm from "@/routes/_main/settings/-components/email-form.tsx";
import ProfileForm from "@/routes/_main/settings/-components/profile-form.tsx";

export const Route = createFileRoute("/_main/settings/account/")({
    component: () => (
        <div className="grid gap-4">
            <ProfileForm />
            <EmailForm />
        </div>
    ),
});