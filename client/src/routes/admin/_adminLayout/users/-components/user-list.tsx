import Button from "@/components/button/button";
import type { User } from "@/data/types";
import { useAdmin } from "@/hooks/admin";
import { formatDate } from "@/lib/format";
import { Pen, Plus, Trash } from "lucide-react";
import React, { useState } from "react";
import UserModal from "./user-modal";
import UserListItem from "./user-list-item";

export default function UserList() {
    /* Create New User Modal */
    const [isOpen, setOpen] = useState<boolean>(false);

    const { users } = useAdmin();

    return (
        <div>
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Users ({users.length})</h1>

                <Button onClick={() => setOpen(true)} size="sm" icon={<Plus className="size-4" />}>
                    Nutzer hinzufügen
                </Button>
            </div>

            <div className='grid gap-2'>

                {users.map((user: User, index: number) => (
                    <UserListItem key={index} user={user} />
                ))}

            </div>

            <UserModal currentUser={null} isOpen={isOpen} onClose={() => setOpen(false)} />
        </div>
    )
}