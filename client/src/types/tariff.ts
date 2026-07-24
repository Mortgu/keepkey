import type { components } from "./api";


export type Tariff = components["schemas"]["Tariff"];

export type TariffRow = components["schemas"]["TariffRow"];
export type TariffColumn = components["schemas"]["TariffColumn"];

export type TariffCell = components["schemas"]["TariffCell"];
export type TariffCellDefault = components["schemas"]["TariffCellDefault"];
export type TariffCellCustomer = components["schemas"]["TariffCellCustomer"];

export type TariffHistory = Omit<TariffHistoryBase, "snapshot"> & { snapshot: Tariff };

export type CreateTariffGroupInput = {
    products: Array<string>
}

export type UpdateTariffGroupInput = {
    products?: Array<string>
}

export type CreateTariffInput = {
    contractId: string
}

