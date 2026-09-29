import "i18next";
import "react-i18next";

import type common from "../../locales/en/common.json";
import type contracts from "../../locales/en/contracts.json";
import type customers from "../../locales/en/customers.json";
import type dashboard from "../../locales/en/dashboard.json";
import type documents from "../../locales/en/documents.json";
import type employees from "../../locales/en/employees.json";
import type flatrates from "../../locales/en/flatrates.json";
import type invoices from "../../locales/en/invoices.json";
import type login from "../../locales/en/login.json";
import type offers from "../../locales/en/offers.json";
import type orders from "../../locales/en/orders.json";
import type search from "../../locales/en/search.json";
import type settings from "../../locales/en/settings.json";
import type suppliers from "../../locales/en/suppliers.json";
import type templates from "../../locales/en/templates.json";
import type versionHistory from "../../locales/en/version-history.json";
import type workloads from "../../locales/en/workloads.json";

type AppResources = typeof common
    & typeof contracts
    & typeof customers
    & typeof dashboard
    & typeof documents
    & typeof employees
    & typeof flatrates
    & typeof invoices
    & typeof login
    & typeof offers
    & typeof orders
    & typeof search
    & typeof settings
    & typeof suppliers
    & typeof templates
    & typeof versionHistory
    & typeof workloads;

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
