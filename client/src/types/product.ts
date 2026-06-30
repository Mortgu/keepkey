import type { components } from "./api";

export type Product = components["schemas"]["Product"];
export type FlatRate = components["schemas"]["FlatRate"];

export type ProductTranslation = components["schemas"]["ProductTranslation"];
export type FlatRateTranslation = components["schemas"]["FlatRateTranslation"];

export type ProductTranslationInput = Pick<
    ProductTranslation,
    "language" | "name" | "description" | "table"
>;
export type CreateProductInput = {
    translations: Array<ProductTranslationInput>;
};
export type UpdateProductInput = Partial<CreateProductInput>;

export type FlatRateTranslationInput = Pick<
    FlatRateTranslation,
    "language" | "name" | "table"
>;
export type CreateFlatRateInput = {
    total_cents: number;
    translations: Array<FlatRateTranslationInput>;
};
export type UpdateFlatRateInput = Partial<CreateFlatRateInput>;
