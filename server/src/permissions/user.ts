import { requirePermission } from "../middlewares/permissions.js";

export const canViewUsers = requirePermission({
  resource: "users",
  action: "view",
  statusCode: 400,
  errorMessage: "Can't view users.",
});

export const canCreateUsers = requirePermission({
  resource: "users",
  action: "create",
  statusCode: 400,
  errorMessage: "Can't create users.",
});

export const canUpdateUsers = requirePermission({
  resource: "users",
  action: "update",
  statusCode: 400,
  errorMessage: "Can't update users.",
});

export const canDeleteUsers = requirePermission({
  resource: "users",
  action: "delete",
  statusCode: 400,
  errorMessage: "Can't delete users.",
});
