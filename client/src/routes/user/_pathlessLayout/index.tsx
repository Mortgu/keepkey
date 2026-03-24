import {createFileRoute, redirect} from '@tanstack/react-router'

export const Route = createFileRoute('/user/_pathlessLayout/')({
    component: RouteComponent,
    beforeLoad: async ({ context }) => {
        const { data: session } = await context.auth.getSession();

        if (!session) {
            throw redirect({ to: '/login' });
        }

        return { session };
    }
})

function RouteComponent() {
    return (
        <div>
            dwadw
        </div>
    )
}
