import type { components } from "./api";

export type User = components["schemas"]["User"];
export type Session = components["schemas"]["Session"];
export type Account = components["schemas"]["Account"];
export type Verification = components["schemas"]["Verification"];

export type CreateUserInput = Omit<
    User,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "sessions"
    | "accounts"
    | "orders"
    | "customer"
    | "offers"
    | "orders"
    | "emailVerified"
>;
export type UpdateUserInput = Partial<CreateUserInput>;
