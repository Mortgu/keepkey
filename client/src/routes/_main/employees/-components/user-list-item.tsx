import { Fragment } from "react";
import UserModal from "./user-modal";

import type { User } from "@/types";
import { formatDate } from "@/lib/format";
import { useModal, useDeleteUser } from "@/hooks";
import { ListItemRow } from "@/components";

interface UserListItemProps {
  user: User;
}

export default function UserListItem({ user }: UserListItemProps) {
  const modal = useModal<User>();

  const { deleteUser, isDeletingUser } = useDeleteUser();

  return (
    <Fragment>
      <ListItemRow
        onEdit={() => modal.open(user)}
        onDelete={() => deleteUser(user.id)}
        deleteLoading={isDeletingUser}
        editLabel="Nutzer bearbeiten"
        deleteLabel="Nutzer löschen"
      >
        <div className="grid gap-0">
          <h1 className="text-md">
            {user.firstName} {user.lastName}
          </h1>
          <p className="text-sm text-gray-500">{formatDate(user.createdAt)}</p>
        </div>
      </ListItemRow>

      {modal.isOpen && (
        <UserModal
          key={modal.key}
          currentUser={modal.data ?? null}
          onClose={modal.close}
        />
      )}
    </Fragment>
  );
}
