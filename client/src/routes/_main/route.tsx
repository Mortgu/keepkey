import Navigation from '@/components/navigation'
import { createFileRoute, Outlet } from '@tanstack/react-router'
import React from 'react'

export const Route = createFileRoute('/_main')({
    component: MainLayoutComponent,
})

function MainLayoutComponent() {
    return (
        <React.Fragment>
            <Navigation />
            <div id="app" className='max-w-(--viewport) m-auto p-4 h-full'>
                <Outlet />
            </div>
        </React.Fragment>
    )
}
