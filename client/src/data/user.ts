import type { User } from '@keepit/schemas';
import { api } from "@/lib/api-client";

export const getSessionUser = () =>
  api<User>("/api/users/session", { method: "GET" });
