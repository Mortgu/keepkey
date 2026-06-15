import type {components} from "./api";

export type Product = components["schemas"]["Product"];
export type FlatRate = components["schemas"]["FlatRate"];
export type Contract = components["schemas"]["Contract"];

export type ProductTranslation = components["schemas"]["ProductTranslation"];
export type FlatRateTranslation = components["schemas"]["FlatRateTranslation"];
export type ContractTranslation = components["schemas"]["ContractTranslation"];

export type ProductTranslationInput = Pick<
    ProductTranslation,
    "language" | "name" | "description" | "table"
>;
export type CreateProductInput = {
    key: string;
    translations: ProductTranslationInput[];
};
export type UpdateProductInput = Partial<CreateProductInput>;

export type FlatRateTranslationInput = Pick<
    FlatRateTranslation,
    "language" | "name" | "table"
>;
export type CreateFlatRateInput = {
    key: string;
    total_cents: number;
    translations: FlatRateTranslationInput[];
};
export type UpdateFlatRateInput = Partial<CreateFlatRateInput>;

export type ContractTranslationInput = Pick<
    ContractTranslation,
    "language" | "name" | "features" | "table"
>;
export type CreateContractInput = {
    key: string;
    translations: ContractTranslationInput[];
};
export type UpdateContractInput = Partial<CreateContractInput>;
