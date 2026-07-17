import i18n from 'i18next';
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// 1. Import your local JSON files directly
import translationEN from '../locals/en/translations.json';
import translationDE from '../locals/de/translations.json';

i18n.use(LanguageDetector).use(initReactI18next).init({
    fallbackLng: 'en',
    lowerCaseLng: true,
    debug: import.meta.env.DEV,
    interpolation: {
        escapeValue: false,
    },
    resources: {
        en: {
            translation: translationEN
        },
        de: {
            translation: translationDE
        }
    }
});

export default i18n;