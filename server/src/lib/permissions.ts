import { createAccessControl } from "better-auth/plugins/access";

const statement = {
    product: ["create", "publish", "update", "delete"],
    contract: ["create", "update", "delete"],
    carts: ['view', 'create', 'update', 'delete'],
};

export const ac = createAccessControl(statement);

export const user = ac.newRole({
    product: [],
    contract: [],
    carts: [],
});

export const admin = ac.newRole({
    product: ["create", "update", "delete", "publish"],
    contract: ["create", "update", "delete"],
    carts: ["view", "create", "update", "delete"],
});
