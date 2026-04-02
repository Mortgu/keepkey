import Button from '@/components/button/button'
import { useAuth } from '@/context/auth';
import { createFileRoute } from '@tanstack/react-router'
import { LogOut } from 'lucide-react';

export const Route = createFileRoute('/user/_pathlessLayout/settings/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { logout } = useAuth();

  return (
    <div>
      <Button variant='secondary' size='sm' onClick={logout} icon={<LogOut className="size-4" />}>Abmelden</Button>
    </div>
  )
}
