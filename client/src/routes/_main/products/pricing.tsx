import { Badge, Button, SearchBar, SortDropdown } from '@/components'
import { MultiDropdown } from '@/components/filters/multi-dropdown'
import { createFileRoute } from '@tanstack/react-router'
import { Pen, Plus, Trash } from 'lucide-react'
import { useState } from 'react'
import { Fragment } from 'react/jsx-runtime'
import PricingModal from './-components/pricing-modal'

export const Route = createFileRoute('/_main/products/pricing')({
    component: RouteComponent,
})

function RouteComponent() {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Fragment>
            <div className="grid gap-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-medium">Preise</h1>
                </div>

                <div className="flex justify-between items-center gap-4">
                    <div className="w-full flex items-center gap-4">

                    </div>

                    <div className="flex items-center gap-2">
                        <Button size="sm" onClick={() => setOpen(true)}>
                            Erstellen <Plus className="size-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <PricingModal open={open} cancelFn={() => setOpen(false)} />
        </Fragment>
    )
}
