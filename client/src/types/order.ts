import type {components} from "./api";

export type Order = components["schemas"]["Order"];
export type OrderPosition = components["schemas"]["OrderPosition"];
export type OrderDocument = components["schemas"]["OrderDocument"];

export type CreateOrderInput = Omit<
    Order,
    | "id"
    | "createdAt"
    | "updatedAt"
    | "customer"
    | "user"
    | "orderPositions"
    | "documents"
    | "tasks"
    | "offer"
    | "employee"
>;
export type UpdateOrderInput = Partial<CreateOrderInput>;

export type CreateOrderPositionInput = Omit<
    OrderPosition,
    "id" | "createdAt" | "order" | "product" | "contract"
>;
export type UpdateOrderPositionInput = Partial<CreateOrderPositionInput>;
