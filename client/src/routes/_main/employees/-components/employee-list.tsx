import { useState } from "react";
import { useTranslation } from "react-i18next";
import UserModal from "./user-modal";
import UserListItem from "./user-list-item";

import type { User } from "@/types";
import { useModal, useUsers } from "@/hooks";
import { ListPage, SearchBar } from "@/components";

export default function EmployeeList() {
  const { t } = useTranslation();
  const { users, isPending, error } = useUsers();
  const modal = useModal<User>();

  const [searchInput, setSearchInput] = useState<string>("");

  return (
    <ListPage
      title={t("section.employees")}
      items={users}
      isPending={isPending}
      error={error}
      keyOf={(u) => u.id}
      createLabel={t("button.create")}
      onCreate={() => modal.open()}
      toolbar={
        <SearchBar
          value={searchInput}
          onChange={setSearchInput}
          onSubmit={() => setSearchInput(searchInput)}
          placeholder={t("common.search")}
        />
      }
      renderItem={(user) => <UserListItem user={user} />}
    >
      {modal.isOpen && (
        <UserModal key={modal.key} currentUser={null} onClose={modal.close} />
      )}
    </ListPage>
  );
}
