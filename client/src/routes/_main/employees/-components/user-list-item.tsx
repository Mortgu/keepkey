
import type { User } from "@keepit/schemas";
import { formatDate } from "@/lib/format";
import { Button } from "@/components";
import { Pen, Trash } from "lucide-react";
import { useDeleteUser } from "@/hooks";

interface UserListItemProps {
  user: User;
  onEdit: (user: User) => void;
}

export default function UserListItem({ user, onEdit }: UserListItemProps) {
  const { deleteUser, isDeletingUser } = useDeleteUser();

  const handleDeleteUser = (id: string) => {
    if (confirm(`Möchten Sie "${user.name}" wirklich löschen?`)) {
      deleteUser(id);
    }

    return;
  }

  return (
    <div className="grid items-center border border-(--border) rounded-md overflow-hidden">
      <div className="grid bg-(--page-bg) px-4 py-3">
        <p className="text-md">{user.name}</p>
        <p className="text-sm text-(--text-secondary)">{formatDate(user.createdAt)}</p>
      </div>

      <div className="flex items-center justify-between border-t border-(--border) px-4 py-2">

        <div className="flex items-center">

        </div>

        <div className="flex items-center gap-2">
          <Button
            size="xs"
            variant="border"
            icon={<Pen size={14} />}
            iconOnly
            aria-label="Zulieferer bearbeiten"
            onClick={() => onEdit(user)}
          />

          <Button
            size="xs"
            variant="border"
            icon={<Trash size={14} />}
            iconOnly
            aria-label="Zulieferer löschen"
            onClick={() => handleDeleteUser(user.id)}
            loading={isDeletingUser}
          />
        </div>

      </div>

    </div>
  );
}
