import React from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Navigation } from '@/components';

export const Route = createFileRoute('/_main')({
    component: MainLayoutComponent,
})

function MainLayoutComponent() {
    return (
        <React.Fragment>
            <Navigation />
            <div id="app" className='max-w-(--viewport) w-full m-auto p-4 h-full'>
                <Outlet />
            </div>
        </React.Fragment>
    )
}
