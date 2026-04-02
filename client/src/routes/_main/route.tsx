import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_main')({
    component: MainLayoutComponent,
})

function MainLayoutComponent() {
    return (
        <div className='max-w-(--viewport) m-auto p-4 h-full'>
            <Outlet />
        </div>
    )
}
