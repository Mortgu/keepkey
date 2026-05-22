import React, { useState } from "react";

import { KeyRound, Pen, Trash } from "lucide-react";
import UserModal from "./user-modal";

import { formatDate } from "@/lib/format";
import { useUserHook } from "@/hooks";
import { Button } from "@/components";
import type { User } from "@/types";

interface UserListItemProps {
  user: User;
}

export default function UserListItem({ user }: UserListItemProps) {
  /* Edit User Modal */
  const [isOpen, setOpen] = useState<boolean>(false);

  const { deleteUser, isDeletingUser } = useUserHook();

  return (
    <React.Fragment>
      <div className="flex items-center justify-between px-4 py-3 border border-(--border) rounded-md">
        <div className="grid gap-0">
          <h1 className="text-md">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-gray-500">{formatDate(user.createdAt)}</p>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex items-center ">
            <Button variant="ghost" size="sm" icon={<Pen className="size-4" />}
              iconOnly onClick={() => setOpen(true)} />

            {/*<Button variant="ghost" size="sm" icon={<KeyRound className="size-4" />} iconOnly /> */}

            <Button variant="ghost" size="sm" icon={<Trash className="size-4" />}
              iconOnly onClick={() => deleteUser({ id: user.id })} loading={isDeletingUser} />
          </div>
        </div>
      </div>

      <UserModal currentUser={user} open={isOpen} cancelFn={() => setOpen(false)} />
    </React.Fragment>
  );
}
