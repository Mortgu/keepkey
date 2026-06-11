import {Button} from '@/components'
import {useAuth} from '@/context/auth';
import {LogOut} from 'lucide-react';

export default function SettingsPage() {
    const {logout} = useAuth();

    return (
        <div className='grid gap-4'>
            

            <Button variant='secondary' size='sm' onClick={logout} icon={<LogOut className="size-4"/>}>Abmelden</Button>

        </div>
    )
}
