import { createFileRoute } from '@tanstack/react-router'
import OfferList from './-components/offer-list'
import { Button } from '@/components'
import { Settings } from 'lucide-react'
import { Fragment } from 'react'
import OfferNextCloudSettingsModal from './-components/nextcloud-components/offer-nextcloud-settings-modal'
import { useModal } from '@/hooks'

export const Route = createFileRoute('/_main/offers/')({
    component: RouteComponent,
})

function RouteComponent() {
    const settingsModal = useModal();

    return (
        <Fragment>
            <div className='grid gap-4'>
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Angebote</h1>
                    <Button onClick={() => settingsModal.open()} variant="ghost" size="sm"
                        icon={<Settings className="size-4" />} iconOnly />
                </div>

                <OfferList />
            </div>

            {settingsModal.isOpen && (
                <OfferNextCloudSettingsModal key={settingsModal.key} onClose={settingsModal.close} />
            )}
        </Fragment>
    )
}
