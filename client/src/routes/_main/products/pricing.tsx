import { Badge, Button, SearchBar, SortDropdown } from '@/components'
import { MultiDropdown } from '@/components/filters/multi-dropdown'
import { createFileRoute } from '@tanstack/react-router'
import { Pen, Plus, Trash } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'

export const Route = createFileRoute('/_main/products/pricing')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="grid gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-medium">Preise</h1>
            </div>

            <div className="flex justify-between items-center gap-4">
                <div className="w-full flex items-center gap-4">

                </div>

                <div className="flex items-center gap-2">
                    <Button size="sm">
                        Erstellen <Plus className="size-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
