import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";

/**
 * Einstieg in die Suche aus der Navigation.
 *
 * Bewusst ein Knopf und kein Eingabefeld: die Suche ist eine eigene Seite, und
 * ein Feld, das beim ersten Tastendruck die Seite wechselt, verliert entweder
 * den Anschlag oder den Fokus. So ist der Übergang eindeutig.
 */
export function NavSearch() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    // Das ⌘K-Kürzel stand bisher nur als Beschriftung im alten Suchfeld, ohne
    // dass es etwas ausgelöst hätte.
    useEffect(() => {
        const handler = (event: KeyboardEvent) => {
            if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                void navigate({ to: "/search" });
            }
        };

        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [navigate]);

    return (
        <button
            type="button"
            onClick={() => void navigate({ to: "/search" })}
            className="w-full flex items-center gap-2.5 rounded-md border border-(--fg-2) px-3 py-2 text-left transition-colors hover:bg-(--fg-2) cursor-pointer"
        >
            <Search className="size-4 shrink-0 text-(--fg-3)" />

            <span className="flex-1 truncate text-[13px] text-(--fg-3)">
                {t("dashboard.search.placeholder")}
            </span>

            <span className="shrink-0 rounded border border-(--fg-2) px-1.5 py-px text-[11px] text-(--fg-3)">
                ⌘K
            </span>
        </button>
    );
}
