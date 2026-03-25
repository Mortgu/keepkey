import { createAccessControl } from "better-auth/plugins/access";

const statement = {
    product: ["create", "share", "update", "delete"],
    contract: ["create", "update", "delete"],
    carts: ['view', 'create', 'update', 'delete'],
};

export const ac = createAccessControl(statement);

export const user = ac.newRole({
    product: ["share"],
    contract: [],
    carts: [],
});

export const admin = ac.newRole({
    product: ["create", "update", "delete", "share"],
    contract: ["create", "update", "delete"],
    carts: ["view", "create", "update", "delete"],
});
