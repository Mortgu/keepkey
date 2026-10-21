
import { Pen, Trash } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { User } from "@keepit/schemas";
import { Button } from "@/components";
import { useDeleteUser, useFormatters } from "@/hooks";

interface UserListItemProps {
  user: User;
  onEdit: (user: User) => void;
}

export default function UserListItem({ user, onEdit }: UserListItemProps) {
  const { t } = useTranslation();
  const { formatDate } = useFormatters();
  const { deleteUser, isDeletingUser } = useDeleteUser();

  const handleDeleteUser = (id: string) => {
    if (confirm(t("employees.deleteConfirm", { name: user.name }))) {
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
            aria-label={t("employees.edit")}
            onClick={() => onEdit(user)}
          />

          <Button
            size="xs"
            variant="border"
            icon={<Trash size={14} />}
            iconOnly
            aria-label={t("employees.delete")}
            onClick={() => handleDeleteUser(user.id)}
            loading={isDeletingUser}
          />
        </div>

      </div>

    </div>
  );
}
