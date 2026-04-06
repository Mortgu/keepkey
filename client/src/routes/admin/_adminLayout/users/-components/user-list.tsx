import type { User } from "@/data/types";
import { useAdmin } from "@/hooks/admin";
import { formatDate } from "@/lib/format";

export default function UserList() {
    const { users } = useAdmin();

    return (
        <div>
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Users ({users.length})</h1>
            </div>

            <div className='grid gap-2'>

                {users.map((user: User, index: number) => (
                    <div key={index} className='flex items-center justify-between gap-3 border border-gray-300 p-2 rounded-md'>
                        <div className="grid gap-0">
                            <h1 className='text-md'>{user.firstName} {user.lastName}</h1>
                            <p className='text-sm text-gray-500'>{formatDate(user.createdAt)}</p>
                        </div>
                        <p className="text-sm text-gray-500">{user.orders?.length} Orders</p>
                    </div>
                ))}

            </div>
        </div>
    )
}