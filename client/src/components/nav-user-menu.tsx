import { Menu } from "@base-ui/react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { ChevronsUpDown, LogOut, Settings, UserCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

/**
 * Der angemeldete Nutzer als Einstiegspunkt der Navigation.
 *
 * Stand vorher als reine Anzeige im Fuss der Navigation, mit dem Abmelden als
 * einzelnem Knopf daneben. Als Menü ist Platz für weitere Aktionen, ohne die
 * Navigation um je eine Schaltfläche zu verlängern.
 */
export function NavUserMenu() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    if (!user) return null;

    return (
        <Menu.Root>
            <Menu.Trigger className="border border-(--fg-2) w-full flex items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-(--fg-2) hover:border-(--fg-3) data-popup-open:bg-(--fg-2) data-popup-open:border-(--fg-3) cursor-pointer">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-(--primary-100)">
                    <UserCircle2 className="size-4" />
                </span>

                <span className="min-w-0 flex-1 text-(--text-inv)">
                    <span className="block truncate text-[13px] font-semibold">
                        {user.firstName} {user.lastName}
                    </span>
                    <span className="block truncate text-[11px] text-(--fg-3)">{user.email}</span>
                </span>

                <ChevronsUpDown className="size-3.5 shrink-0 text-(--fg-3)" />
            </Menu.Trigger>

            <Menu.Portal>
                {/* Kein `sideOffset`: der Popup bringt sein `mt-2` schon mit,
                    beides zusammen ergäbe den doppelten Abstand. */}
                <Menu.Positioner className='w-auto' align="start" side="bottom">
                    {/* `--anchor-width` setzt der Positioner auf die Breite des
                        Triggers — das Menü liegt damit bündig darunter, auch
                        wenn die Navigation später eine andere Breite bekommt. */}
                    <Menu.Popup className='border border-(--fg-3) bg-(--fg-2) right-0 mt-2 rounded-md p-1 w-[var(--anchor-width)] text-white'>
                        <Menu.Item
                            className='w-full flex items-center justify-start gap-2 py-2 px-3 rounded-sm text-sm hover:bg-(--fg-3)'
                            onClick={() => void navigate({ to: "/settings" })}
                        >
                            <Settings size={14} /> {t("nav.settings")}
                        </Menu.Item>

                        <Menu.Item className='w-full flex items-center justify-start gap-2 py-2 px-3 rounded-sm text-sm hover:bg-(--fg-3)' onClick={() => void logout()}>
                            <LogOut size={14} /> {t("nav.logout")}
                        </Menu.Item>
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    );
}
