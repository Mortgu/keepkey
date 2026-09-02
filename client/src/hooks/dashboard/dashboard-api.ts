import type { DashboardStats } from "@keepit/schemas";
import { api } from "@/lib/api-client";

/** Kennzahlen und Zeitreihe des Dashboards — serverseitig aggregiert. */
export const getDashboardStats = () =>
    api<DashboardStats>("/api/dashboard/stats", { method: "GET" });
