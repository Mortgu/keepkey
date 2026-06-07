import { createFileRoute } from "@tanstack/react-router";
import { MainLayoutComponent } from "./-layout";

import { requireSession } from "@/lib/session";

export const Route = createFileRoute("/_main")({
  beforeLoad: ({ context }) => requireSession(context),
  component: MainLayoutComponent,
});
