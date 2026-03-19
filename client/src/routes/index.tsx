
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {
    return (
        <div className="">
            <h3>Welcome Home!</h3>
        </div>
    )
}