import { Loader, User } from "lucide-react";
import { authClient } from "@/lib/auth-client.ts";
import { NavLink } from "./nav-link";

export function Navigation() {
  const { data: session, isPending, error } = authClient.useSession();

  return (
    <div className="h-18 w-full border-b border-(--border) bg-white">
      <div className="flex max-w-(--viewport) m-auto px-4 items-center h-full justify-between">
        <div className="flex h-full gap-8">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/contracts">Tarife</NavLink>
          <NavLink to="/employees">Nutzer</NavLink>
          <NavLink to="/customers">Kunden</NavLink>
          <NavLink to="/orders">Bestellungen</NavLink>
          <NavLink to="/offers">Angebote</NavLink>
        </div>

        <div className="flex h-full">
          {isPending ? (
            <Loader className="animate-spin" />
          ) : error ? (
            "Error"
          ) : session ? (
            <NavigationActions />
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to="/login">Login</NavLink>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function NavigationActions() {
  return (
    <div className="flex gap-4">
      <div className="w-8 h-full m-auto hover:text-(--primary) cursor-pointer">
        <NavLink to="/user">
          <User className="size-6" />
        </NavLink>
      </div>
    </div>
  );
}
