import type { components } from "./api";

export type TariffGroup = components["schemas"]["TariffGroup"];
export type TariffGroupProduct = components["schemas"]["TariffGroupProduct"];

export type Tariff = components["schemas"]["Tariff"];

export type TariffRow = components["schemas"]["TariffRow"];
export type TariffColumn = components["schemas"]["TariffColumn"];

export type TariffCell = components["schemas"]["TariffCell"];
export type TariffCellDefault = components["schemas"]["TariffCellDefault"];
export type TariffCellCustomer = components["schemas"]["TariffCellCustomer"];

export type TariffHistoryBase = components["schemas"]["TariffHistory"];
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
export type UpdateTariffInput = Partial<CreateTariffInput>;

export type NewTariffCell = Omit<TariffCell, "row">;
export type NewTariffRow = Omit<TariffRow, "tariff" | "cells"> & { cells: Array<NewTariffCell> };