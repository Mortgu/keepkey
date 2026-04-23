import Button from '@/components/button/button'
import ModalDialog from '@/components/modal';
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/admin/_adminLayout/')({
    component: AdminIndexComponent,
})

function AdminIndexComponent() {
    const [isOpen, setOpen] = useState<boolean>(false);

    return (
        <>
            <Button onClick={() => setOpen(true)}>Open</Button>

            <ModalDialog open={isOpen} cancelFn={() => setOpen(false)}>
                <ModalDialog.Header>
                    dwad
                </ModalDialog.Header>
                <ModalDialog.Content>
                    dwadw
                </ModalDialog.Content>
            </ModalDialog>
        </>
    )
}
