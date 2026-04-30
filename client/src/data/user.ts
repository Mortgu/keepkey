import { api } from "@/lib/api-client";
import type { BaseUser, User } from "./types";

export const getSessionUser = () =>
  api<any>("/api/users/session", { method: "GET" });

export const getAllUsersAction = () =>
  api<any>("/api/users", { method: "GET" });

export const updateUserByIdAction = (id: string, body: BaseUser) =>
  api<any>(`/api/users/${id}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body }),
  });

export const createUserAction = (body: Partial<User>) =>
  api<any>(`/api/users`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body }),
  });

export const deleteUserAction = (id: string) =>
  api<any>(`/api/users/${id}`, { method: "DELETE" });
