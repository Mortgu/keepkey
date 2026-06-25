import type { components } from "./api";

export type Contract = components["schemas"]["Contract"];
export type ContractTranslation = components["schemas"]["ContractTranslation"];

export type ContractTranslationInput = Pick<
    ContractTranslation,
    "language" | "name" | "features" | "table"
>;

export type CreateContractInput = {
    translations: Array<ContractTranslationInput>;
};

export type UpdateContractInput = Partial<CreateContractInput>;
