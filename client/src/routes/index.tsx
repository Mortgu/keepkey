
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
    component: Index,
})

function Index() {

    const handleClick = async () => {
          const result = await fetch('http://localhost:3000/api/products', {
              method: 'GET',
              credentials: 'include',
          });

          const data = await result.json();

          console.log(data)
    }

    return (
        <div className="">
            <h3>Welcome Home!</h3>

            <button onClick={handleClick} className='p-4 bg-blue-500'>get Products</button>
        </div>
    )
}