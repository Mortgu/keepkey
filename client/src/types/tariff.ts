import type {components} from "./api";

export type Tariff = components["schemas"]["Tariff"];
export type TariffRow = components["schemas"]["TariffRow"];
export type TariffCell = components["schemas"]["TariffCell"];
export type TariffCellCustomerPrice = components["schemas"]["TariffCellCustomerPrice"];

export type CreateTariffInput = Omit<Tariff, "id">;
export type UpdateTariffInput = Partial<CreateTariffInput>;

export type NewTariffCell = Omit<TariffCell, "row">;
export type NewTariffRow = Omit<TariffRow, "tariff" | "cells"> & { cells: NewTariffCell[] };