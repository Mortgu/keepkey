import "i18next";
import "react-i18next";

import type { en } from "./i18n";

/** Abgeleitet aus der Laufzeit-Registrierung in `i18n.ts` — EN ist die Referenz. */
type AppResources = typeof en;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: AppResources;
  }
}

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: AppResources;
  }
}
