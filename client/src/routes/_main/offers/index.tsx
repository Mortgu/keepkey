import { createFileRoute } from '@tanstack/react-router'
import OfferList from './-components/offer-list'
import { Button } from '@/components'
import { Settings } from 'lucide-react'
import { Fragment, useState } from 'react'
import OfferNextCloudSettingsModal from './-components/nextcloud-components/offer-nextcloud-settings-modal'

export const Route = createFileRoute('/_main/offers/')({
    component: RouteComponent,
})

function RouteComponent() {
    const [nextCloudSettings, setNextCloudSettings] = useState<boolean>(false);

    return (
        <Fragment>
            <div className='grid gap-4'>
                {/* Page header */}
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Angebote</h1>
                    <Button onClick={() => setNextCloudSettings(true)} variant="ghost" size="sm" icon={<Settings className="size-4" />} iconOnly />
                </div>

                <OfferList />
            </div>

            <OfferNextCloudSettingsModal open={nextCloudSettings}
                cancelFn={() => setNextCloudSettings(false)} />
        </Fragment>
    )
}
