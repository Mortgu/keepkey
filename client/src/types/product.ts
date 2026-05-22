import type { components } from "./api";

export type Product = components["schemas"]["Product"];
export type Tariff = components["schemas"]["Tariff"];
export type TariffConfig = components["schemas"]["TariffConfig"];
export type TariffCustomer = components["schemas"]["TariffCustomer"];
export type FlatRate = components["schemas"]["FlatRate"];
export type Contract = components["schemas"]["Contract"];

export type CreateProductInput = Pick<
  Product,
  "name" | "description" | "table"
>;
export type UpdateProductInput = Partial<CreateProductInput>;

export type CreateTariffInput = { productIds: string[] };
export type UpdateTariffInput = { productIds: string[] };

export type CreateTariffConfigInput = Omit<
  TariffConfig,
  "id" | "tariff" | "tariffId" | "contract"
>;
export type UpdateTariffConfigInput = Partial<CreateTariffConfigInput>;

export type CreateTariffCustomerInput = Omit<
  TariffCustomer,
  "id" | "tariff" | "tariffId" | "product" | "contract" | "customer"
>;
export type UpdateTariffCustomerInput = Partial<CreateTariffCustomerInput>;

export type CreateFlatRateInput = Omit<FlatRate, "id" | "offerFlatRates">;
export type UpdateFlatRateInput = Partial<CreateFlatRateInput>;

export type CreateContractInput = Omit<
  Contract,
  "id" | "createdAt" | "orderPositions" | "offerPositions" | "tariffCustomers" | "tariffConfigs"
>;
export type UpdateContractInput = Partial<CreateContractInput>;
