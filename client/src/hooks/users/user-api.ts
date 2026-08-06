import type {
    CreateUserInput,
    UpdateUserInput,
    User,
    UserFilterParams,
} from '@keepit/schemas';
import { api } from "@/lib/api-client";
import { formatQueryString } from '@/lib/utils';

export const getSessionUser = () =>
    api<User>("/api/users/session", { method: "GET" });

export const getUsers = (filters: UserFilterParams = {}) =>
    api<Array<User>>(`/api/users?${formatQueryString(filters)}`, {
        method: "GET"
    });

export const createUser = (body: CreateUserInput) =>
    api<User>("/api/users", {
        method: "POST",
        body: JSON.stringify(body),
    });

export const updateUser = (id: string, body: UpdateUserInput) =>
    api<User>(`/api/users/${id}`, {
        method: "PUT",
        body: JSON.stringify(body),
    });

export const deleteUser = (id: string) =>
    api<void>(`/api/users/${id}`, { method: "DELETE" });
