import { createAccessControl } from "better-auth/plugins/access";

const statement = {
  users: ["view", "create", "update", "delete"],
} as const;

export const ac = createAccessControl(statement);

export const employee = ac.newRole({
  users: [],
});

export const admin = ac.newRole({
  users: ["view", "create", "update", "delete"],
});
