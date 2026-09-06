import { useTranslation } from "react-i18next";

import EmailForm from "./-components/email-form";
import PasskeyForm from "./-components/passkey-form";
import PasswordForm from "./-components/password-form";
import ProfileForm from "./-components/profile-form";
import { Breadcrumbs } from "@/components";

/**
 * Einstellungen des angemeldeten Nutzers auf einer Seite.
 *
 * Vorher lagen Konto und Sicherheit als eigene Reiter-Routen darunter. Die
 * Reiter trugen aber die einzige Beschriftung, die die Formulare haben — ohne
 * sie stünden hier vier gleich aussehende Kästen. Deshalb überschreibt jetzt
 * eine Zwischenüberschrift je Gruppe, was die Reiter vorher geleistet haben.
 */
export default function SettingsPage() {
    const { t } = useTranslation();

    return (
        <div className="grid gap-4 mx-4">
            <div className="flex items-center justify-between gap-4 border-b border-(--border) h-14">
                <Breadcrumbs
                    size="sm"
                    maxItems={4}
                    items={[
                        { label: "Dashboard", to: "/" },
                        { label: t("nav.settings"), to: "/settings" },
                    ]}
                />
            </div>

            <section className="grid gap-2">
                <h2 className="text-md font-medium">{t("settings.account")}</h2>
                <ProfileForm />
                <EmailForm />
            </section>

            <section className="grid gap-2">
                <h2 className="text-md font-medium">{t("settings.security")}</h2>
                <PasswordForm />
                <PasskeyForm />
            </section>
        </div>
    );
}
