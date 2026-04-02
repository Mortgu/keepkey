import Button from '@/components/button/button'
import { useAuth } from '@/context/auth';
import { createFileRoute } from '@tanstack/react-router'
import { LogOut, Trash } from 'lucide-react';

export const Route = createFileRoute('/user/_pathlessLayout/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { logout, deleteAccount } = useAuth();

  return (
    <div className='grid gap-4'>
      <Button variant='secondary' size='sm' onClick={logout} icon={<LogOut className="size-4" />}>Abmelden</Button>


      {/* Danger Zone - Delete Account */}
      <div className='flex items-center justify-between bg-red-100 p-4 rounded-md border-2 border-red-200'>
        <div className='grid gap-1'>
          <h1 className='font-semibold text-md'>Delete Account?</h1>
          <p className='text-sm'>By clicking "Delete", your account and all its details are permanantly removed from our server. You won't be able to sign in again!</p>
        </div>
        <Button onClick={() => deleteAccount()} danger icon={<Trash className='size-4' />} size="sm">Delete</Button>
      </div>

    </div>
  )
}
