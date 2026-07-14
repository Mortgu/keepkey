import { PageWidth } from "@/components";
import EmailForm from "@/routes/_main/settings/-components/email-form.tsx";
import PasswordForm from "@/routes/_main/settings/-components/password-form.tsx";
import ProfileForm from "@/routes/_main/settings/-components/profile-form.tsx";
import TemplateList from "@/routes/_main/settings/-components/template-list.tsx";

export default function SettingsPage() {
    return (
        <PageWidth>
            <div className='grid gap-4'>
                <h1 className="text-2xl font-semibold">Einstellungen</h1>

                <ProfileForm />

                <div className="grid md:grid-cols-2 gap-4 items-start">
                    <EmailForm />
                    <PasswordForm />
                </div>

                <TemplateList />
            </div>
        </PageWidth>
    )
}
