import React from 'react';
import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Navigation } from '@/components';
import { ToastContainer } from 'react-toastify';

export const Route = createFileRoute('/_main')({
    component: MainLayoutComponent,
})

function MainLayoutComponent() {
    return (
        <React.Fragment>
            <Navigation />
            <div id="app" className='bg-white rounded-lg m-1 p-6'>
                <div className='w-full max-w-(--viewport) m-auto'>
                    <Outlet />
                    <ToastContainer />
                </div>
            </div>
        </React.Fragment>
    )
}
