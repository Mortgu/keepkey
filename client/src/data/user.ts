import type { CreateUserInput, UpdateUserInput, User } from "@/types";
import { api } from "@/lib/api-client";


export const getSessionUser = () =>
  api<User>("/api/users/session", { method: "GET" });

export const getAllUsersAction = () =>
  api<Array<User>>("/api/users", { method: "GET" });

export const createUserAction = (body: CreateUserInput) =>
  api<User>(`/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body }),
  });

export const updateUserByIdAction = (id: string, body: UpdateUserInput) =>
  api<User>(`/api/users/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body }),
  });

export const deleteUserAction = (id: string) =>
  api<void>(`/api/users/${id}`, { method: "DELETE" });
