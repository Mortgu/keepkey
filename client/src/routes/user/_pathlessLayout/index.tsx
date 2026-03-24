import {createFileRoute, redirect} from '@tanstack/react-router'

export const Route = createFileRoute('/user/_pathlessLayout/')({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        const { data: session } = await context.auth.getSession();

        if (!session) {
            throw redirect({ to: '/login' });
        }

        return { session };
    },
    notFoundComponent: ({ data }) => {
        return (
            <div className='p-4 bg-gray-100 rounded-md border border-gray-200'>
                <p>Diese Seite existiert nicht.</p>
            </div>
        )
    }
})

function RouteComponent() {
    return (
        <div>
            dwadw
        </div>
    )
}
