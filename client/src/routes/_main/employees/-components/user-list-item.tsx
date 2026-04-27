import Button from "@/components/button/button";
import type { User } from "@/data/types"
import { formatDate } from "@/lib/format";
import {KeyRound, Pen, Trash} from "lucide-react";
import React, { useState } from "react"
import UserModal from "./user-modal";
import { useAdmin } from "@/hooks/admin";

interface UserListItemProps {
    user: User,
};

export default function UserListItem({ user }: UserListItemProps) {
    /* Edit User Modal */
    const [isOpen, setOpen] = useState<boolean>(false);

    const { deleteUser, isDeletingUser } = useAdmin();

    return (
        <React.Fragment>
            <div className='flex items-center justify-between px-4 py-3 border border-(--border) rounded-md'>
                <div className="grid gap-0">
                    <h1 className='text-md'>{user.firstName} {user.lastName}</h1>
                    <p className='text-sm text-gray-500'>{formatDate(user.createdAt)}</p>
                </div>

                <div className="flex items-center gap-12">

                    <div className="flex items-center ">
                        <Button onClick={() => setOpen(true)} size='sm' variant="ghost" icon={<Pen className="size-4" />} iconOnly></Button>

                        <Button onClick={() => {}} size='sm' variant="ghost"
                            icon={<KeyRound className="size-4" />} iconOnly />

                        <Button onClick={() => deleteUser({ id: user.id })} size='sm' variant="ghost"
                                icon={<Trash className="size-4" />} iconOnly loading={isDeletingUser} />

                    </div>
                </div>
            </div>

            <UserModal currentUser={user} open={isOpen} cancelFn={() => setOpen(false)} />
        </React.Fragment>
    )
}