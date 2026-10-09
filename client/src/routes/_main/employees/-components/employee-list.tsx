import UserListItem from "./user-list-item";

import type { User } from "@keepit/schemas";
import type { EmployeeFilter } from "../-hooks/use-employee-filters";
import { useUsers } from "@/hooks";

interface Props {
  filters: EmployeeFilter;
  onEdit: (employee: User) => void;
}


export default function EmployeeList({ filters, onEdit }: Props) {
  const { users } = useUsers(filters.params);

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
