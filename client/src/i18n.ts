import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import commonEN from '../locales/en/common.json';
import offersEN from '../locales/en/offers.json';
import versionHistoryEN from '../locales/en/versionHistory.json';
import dashboardEN from '../locales/en/dashboard.json';
import errorsEN from '../locales/en/errors.json';

import commonDE from '../locales/de/common.json';
import offersDE from '../locales/de/offers.json';
import versionHistoryDE from '../locales/de/versionHistory.json';
import dashboardDE from '../locales/de/dashboard.json';
import errorsDE from '../locales/de/errors.json';

i18n.use(LanguageDetector).use(initReactI18next).init({
    fallbackLng: 'en',
    lowerCaseLng: true,
    debug: import.meta.env.DEV,
    interpolation: {
        escapeValue: false,
    },
    resources: {
        en: {
            translation: { ...commonEN, ...offersEN, ...versionHistoryEN, ...dashboardEN, ...errorsEN }
        },
        de: {
            translation: { ...commonDE, ...offersDE, ...versionHistoryDE, ...dashboardDE, ...errorsDE }
        }
    }
});

export default i18n;