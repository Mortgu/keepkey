import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEN from '../locales/en/common.json';
import contractsEN from '../locales/en/contracts.json';
import customerEN from '../locales/en/customer.json';
import dashboardEN from '../locales/en/dashboard.json';
import employeesEN from '../locales/en/employees.json';
import errorsEN from '../locales/en/errors.json';
import flatratesEN from '../locales/en/flatrates.json';
import invoicesEN from '../locales/en/invoices.json';
import loginEN from '../locales/en/login.json';
import offersEN from '../locales/en/offers.json';
import ordersEN from '../locales/en/orders.json';
import searchEN from '../locales/en/search.json';
import settingsEN from '../locales/en/settings.json';
import suppliersEN from '../locales/en/suppliers.json';
import versionHistoryEN from '../locales/en/versionHistory.json';
import workloadsEN from '../locales/en/workloads.json';

import commonDE from '../locales/de/common.json';
import contractsDE from '../locales/de/contracts.json';
import customerDE from '../locales/de/customer.json';
import dashboardDE from '../locales/de/dashboard.json';
import employeesDE from '../locales/de/employees.json';
import errorsDE from '../locales/de/errors.json';
import flatratesDE from '../locales/de/flatrates.json';
import invoicesDE from '../locales/de/invoices.json';
import loginDE from '../locales/de/login.json';
import offersDE from '../locales/de/offers.json';
import ordersDE from '../locales/de/orders.json';
import searchDE from '../locales/de/search.json';
import settingsDE from '../locales/de/settings.json';
import suppliersDE from '../locales/de/suppliers.json';
import versionHistoryDE from '../locales/de/versionHistory.json';
import workloadsDE from '../locales/de/workloads.json';

/*
 * Eine Sprachdatei je Route, dazu `common` für Geteiltes.
 *
 * Alle liegen in **einem** `translation`-Namensraum — die Dateien sind Ordnung,
 * keine i18next-Namensräume. Daraus folgt die einzige Regel: jede Datei kapselt
 * ihre Schlüssel in einem eigenen Objekt (`{ "orders": { … } }`), sonst
 * überschreiben zwei Routen einander bei gleichem Schlüsselnamen.
 *
 * `errors` ist die Ausnahme und wird als Ganzes verschachtelt: die Datei ist
 * nach Fehlercode geschlüsselt (`NO_CELL`, `VERSION_CONFLICT`, …), und
 * `getErrorMessage` schlägt sie als `errors.<CODE>` nach.
 *
 * Eine neue Route braucht: Datei anlegen, hier importieren, unten einreihen.
 */
const en = {
    translation: {
        ...commonEN,
        ...contractsEN,
        ...customerEN,
        ...dashboardEN,
        ...employeesEN,
        ...flatratesEN,
        ...invoicesEN,
        ...loginEN,
        ...offersEN,
        ...ordersEN,
        ...searchEN,
        ...settingsEN,
        ...suppliersEN,
        ...versionHistoryEN,
        ...workloadsEN,

        errors: errorsEN,
    },
};

const de = {
    translation: {
        ...commonDE,
        ...contractsDE,
        ...customerDE,
        ...dashboardDE,
        ...employeesDE,
        ...flatratesDE,
        ...invoicesDE,
        ...loginDE,
        ...offersDE,
        ...ordersDE,
        ...searchDE,
        ...settingsDE,
        ...suppliersDE,
        ...versionHistoryDE,
        ...workloadsDE,

        errors: errorsDE,
    },
};

i18n.use(LanguageDetector).use(initReactI18next).init({
    fallbackLng: 'en',
    lowerCaseLng: true,
    debug: import.meta.env.DEV,
    interpolation: {
        escapeValue: false,
    },
    resources: { en, de },
});

export default i18n;
