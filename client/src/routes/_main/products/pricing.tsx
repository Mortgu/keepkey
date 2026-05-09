import { Badge, Button } from '@/components'
import { createFileRoute } from '@tanstack/react-router'
import { Pen, Trash } from 'lucide-react'
import { Fragment } from 'react/jsx-runtime'

export const Route = createFileRoute('/_main/products/pricing')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <Fragment>
            <div className='border border-(--border) rounded-md overflow-hidden'>
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-1.5 border-b border-(--border) bg-(--page-bg)">
                    <span className="text-caption text-gray-400">Vertrag</span>
                    <span className="text-caption text-gray-400 text-center">
                        Menge
                    </span>
                    <span className="text-caption text-gray-400 text-center">
                        Laufzeit
                    </span>
                    <span className="text-caption text-gray-400 text-right">
                        Preis
                    </span>
                    <span />
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-1 odd:border-t border-(--border)">
                    <p className="text-sm text-gray-700 truncate">
                        <Badge variant="generated">Buissness Essentials</Badge>
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                        1–100
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                        12 Monate
                    </p>
                    <p className="text-sm font-medium text-gray-900 text-right">
                        2.44 €
                    </p>
                    <div className="flex items-center gap-0.5 justify-end">
                        <Button variant="link" iconOnly size="sm"
                            icon={<Pen className="size-3.5" />} />

                        <Button variant="link" size="sm" iconOnly
                            icon={<Trash className="size-3.5" />} />
                    </div>
                </div>
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1fr] items-center px-4 py-1 odd:border-t border-(--border)">
                    <p className="text-sm text-gray-700 truncate">
                        <Badge variant="generated">Buissness Essentials</Badge>
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                        1–100
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                        12 Monate
                    </p>
                    <p className="text-sm font-medium text-gray-900 text-right">
                        2.44 €
                    </p>
                    <div className="flex items-center gap-0.5 justify-end">
                        <Button variant="link" iconOnly size="sm"
                            icon={<Pen className="size-3.5" />} />

                        <Button variant="link" size="sm" iconOnly
                            icon={<Trash className="size-3.5" />} />
                    </div>
                </div>
            </div>
        </Fragment >
    )
}
