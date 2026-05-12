import { Plus } from "lucide-react";
import { useState } from "react";
import UserModal from "./user-modal";
import UserListItem from "./user-list-item";

import { useUserHook } from "@/hooks";
import type { User } from "@/types";
import { Button } from "@/components";

export default function UserList() {
  /* Create New User Modal */
  const [isOpen, setOpen] = useState<boolean>(false);

  const { users } = useUserHook();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
          Users ({users.length})
        </h1>

        <Button size="sm" icon={<Plus className="size-4" />} onClick={() => setOpen(true)} >
          Nutzer hinzufügen
        </Button>
      </div>

      <div className="grid gap-2">
        {users.map((user: User, index: number) => (
          <UserListItem key={index} user={user} />
        ))}
      </div>

      <UserModal currentUser={null} open={isOpen} cancelFn={() => setOpen(false)} />
    </div>
  );
}
