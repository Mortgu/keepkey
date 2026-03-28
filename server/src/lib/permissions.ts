import { createAccessControl } from "better-auth/plugins/access";

const statement = {
    products: ["create", "publish", "update", "delete"],
    contracts: ["create", "update", "delete"],
    carts: ['view', 'create', 'update', 'delete'],
    orders: ['view', 'create', 'update', 'delete'],
    users: ['view', 'create', 'update', 'delete'],
};

export const ac = createAccessControl(statement);

export const user = ac.newRole({
    products: [],
    contracts: [],
    carts: [],
    orders: [],
    users: [],
});

export const admin = ac.newRole({
    products: ["create", "update", "delete", "publish"],
    contracts: ["create", "update", "delete"],
    carts: ["view", "create", "update", "delete"],
    orders: ["view", "create", "update", "delete"],
    users: ['view', 'create', 'update', 'delete'],
});
