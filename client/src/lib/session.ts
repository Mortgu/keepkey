import { redirect } from "@tanstack/react-router";
import type { authClient } from "@/lib/auth-client";

export type RouterContext = {
  auth: typeof authClient;
};

export async function requireSession(context: RouterContext) {
  const { data: session } = await context.auth.getSession();

  if (!session) {
    throw redirect({
      to: "/login",
      search: { redirect: window.location.href },
    });
  }

  return session;
}

export async function requireAdmin(context: RouterContext) {
  const session = await requireSession(context);

  const roles = (session.user.role ?? "").split(",").map((role) => role.trim());

  if (!roles.includes("admin")) {
    throw redirect({ to: "/" });
  }

  return session;
}
