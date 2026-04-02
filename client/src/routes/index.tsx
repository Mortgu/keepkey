
import Button from '@/components/button/button';
import { createFileRoute } from '@tanstack/react-router'
import { TrashIcon } from 'lucide-react';

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    return (
        <div className="flex gap-4 items-center">
            <Button size='xs' variant='primary'>XS Primary</Button>
            <Button size='sm' variant='primary'>SM Primary</Button>
            <Button size='md' variant='primary'>MD Primary</Button>
            <Button size='sm' danger variant='primary'>SM Danger</Button>
            <Button size='sm' danger variant='primary' icon={<TrashIcon className='size-4' />}>SM Danger</Button>
            <Button size='sm' loading danger variant='primary' icon={<TrashIcon className='size-4' />}>SM Danger</Button>
            <Button size='sm' variant='secondary' iconOnly icon={<TrashIcon className='size-4' />} />

            <Button size='sm' variant='secondary'>SM Seconary</Button>
            <Button size='md' variant='secondary'>MD Seconary</Button>
        </div>
    );
}
