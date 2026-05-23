import { Plus } from "lucide-react";
import UserModal from "./user-modal";
import UserListItem from "./user-list-item";

import { useModal, useUserHook } from "@/hooks";
import type { User } from "@/types";
import { Button } from "@/components";

export default function UserList() {
  const modal = useModal();

  const { users } = useUserHook();

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
          Users ({users.length})
        </h1>

        <Button size="sm" icon={<Plus className="size-4" />} onClick={() => modal.open()}>
          Nutzer hinzufügen
        </Button>
      </div>

      <div className="grid gap-2">
        {users.map((user: User, index: number) => (
          <UserListItem key={index} user={user} />
        ))}
      </div>

      {modal.isOpen && (
        <UserModal key={modal.key} currentUser={null} onClose={modal.close} />
      )}
    </div>
  );
}
