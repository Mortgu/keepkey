import { api } from "@/lib/api-client";
import type { User } from '@keepit/schemas';

export const getSessionUser = () =>
  api<User>("/api/users/session", { method: "GET" });
