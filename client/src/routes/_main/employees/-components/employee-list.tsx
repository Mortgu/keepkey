import { useState } from "react";
import { useTranslation } from "react-i18next";
import UserListItem from "./user-list-item";

import type { User } from "@keepit/schemas";
import { useModal, useUsers } from "@/hooks";
import type { EmployeeFilter } from "../-hooks/use-employee-filters";

interface Props {
  filters: EmployeeFilter;
  onEdit: (employee: User) => void;
}


export default function EmployeeList({ filters, onEdit }: Props) {
  const { t } = useTranslation();
  const { users, isPending, error } = useUsers(filters.params);
  const modal = useModal<User>();

  const [searchInput, setSearchInput] = useState<string>("");

  return (
    <div className="grid gap-4">
      {users.map((user) => (
        <UserListItem
          key={user.id}
          user={user}
          onEdit={onEdit}
        />
      ))}
    </div>
  );
}
