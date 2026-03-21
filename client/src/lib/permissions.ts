import { createAccessControl } from "better-auth/plugins/access";

const statement = {
    product: ["create", "share", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const user = ac.newRole({
    product: ["share"],
});

export const admin = ac.newRole({
    product: ["create", "update", "delete", "share"],
});