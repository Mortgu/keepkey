import "i18next";
import "react-i18next";

import type common from "../../locales/en/common.json";
import type offers from "../../locales/en/offers.json";
import type versionHistory from "../../locales/en/versionHistory.json";
import type dashboard from "../../locales/en/dashboard.json";
import type errors from "../../locales/en/errors.json";

type AppResources = typeof common & typeof offers & typeof versionHistory & typeof dashboard & typeof errors;

declare module "i18next" {
  interface CustomTypeOptions {
    resources: AppResources;
  }
}

declare module "react-i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: AppResources;
  }
}
