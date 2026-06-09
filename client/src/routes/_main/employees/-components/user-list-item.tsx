import React from "react";

import { Pen, Trash } from "lucide-react";
import UserModal from "./user-modal";

import type { User } from "@/types";
import { formatDate } from "@/lib/format";
import { useModal, useUserHook } from "@/hooks";
import { Button } from "@/components";

interface UserListItemProps {
  user: User;
}

export default function UserListItem({ user }: UserListItemProps) {
  const modal = useModal<User>();

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
            <Button
              variant="ghost"
              size="sm"
              icon={<Pen className="size-4" />}
              iconOnly
              onClick={() => modal.open(user)}
            />

            <Button
              variant="ghost"
              size="sm"
              icon={<Trash className="size-4" />}
              iconOnly
              onClick={() => deleteUser({ id: user.id })}
              loading={isDeletingUser}
            />
          </div>
        </div>
      </div>

      {modal.isOpen && (
        <UserModal
          key={modal.key}
          currentUser={modal.data ?? null}
          onClose={modal.close}
        />
      )}
    </React.Fragment>
  );
}
