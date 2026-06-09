import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import UserModal from "./user-modal";
import UserListItem from "./user-list-item";

import type { User } from "@/types";
import { useModal, useUserHook } from "@/hooks";
import { Button, SearchBar } from "@/components";

export default function UserList() {
  const { t } = useTranslation();
  const { users } = useUserHook();
  const modal = useModal();

  const [searchInput, setSearchInput] = useState<string>("");

  return (
    <>
      <div className="flex justify-between items-center gap-4">
        <div className="w-full flex items-center gap-4">
          <SearchBar
            value={searchInput}
            onChange={setSearchInput}
            onSubmit={() => setSearchInput(searchInput)}
            placeholder={t("common.search")}
          />
          <Button
            size="sm"
            icon={<Plus className="size-4" />}
            onClick={() => modal.open()}
          >
            {t("button.create")}
          </Button>
        </div>
      </div>

      <div className="grid gap-2">
        {users.map((user: User, index: number) => (
          <UserListItem key={index} user={user} />
        ))}
      </div>

      {modal.isOpen && (
        <UserModal key={modal.key} currentUser={null} onClose={modal.close} />
      )}
    </>
  );
}
