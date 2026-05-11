import type { components } from "./api";

export type Product = components["schemas"]["Product"];
export type ProductPricing = components["schemas"]["ProductPricing"];
export type FlatRate = components["schemas"]["FlatRate"];
export type Contract = components["schemas"]["Contract"];

export type CreateProductInput = Pick<
  Product,
  "name" | "description" | "table"
>;
export type UpdateProductInput = Partial<CreateProductInput>;

export type CreateProductPricingInput = Omit<
  ProductPricing,
  "id" | "contract" | "product"
>;
export type UpdateProductPricingInput = Partial<CreateProductPricingInput>;

export type CreateFlatRateInput = Omit<FlatRate, "id" | "offerFlatRates">;
export type UpdateFlatRateInput = Partial<CreateFlatRateInput>;

export type CreateContractInput = Omit<
  Contract,
  "id" | "createdAt" | "productPricing" | "orderPositions" | "offerPositions" | "tariffCustomers" | "tariffProduct"
>;
export type UpdateContractInput = Partial<CreateContractInput>;
