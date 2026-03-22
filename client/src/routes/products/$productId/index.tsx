import { createFileRoute } from '@tanstack/react-router'
import {useQuery} from "@tanstack/react-query";
import {getProduct } from "@/data/products.ts";
import {Loader, Pen} from "lucide-react";
import Button from "@/components/button/button.tsx";
import {useAuth} from "@/context/auth.tsx";

export const Route = createFileRoute('/products/$productId/')({
  loader: async ({ params }) => {
    return getProduct(params.productId)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { productId } = Route.useParams();
  const { user, isLoading } = useAuth();

  const { data, isPending, error } = useQuery({
    queryKey: ['product'],
    queryFn: () => getProduct(productId),
  });

  if (isPending || isLoading) {
    return (
        <Loader className='animate-spin' />
    )
  }

  if (error) {
    return (
        <div className='p-2 bg-red-200 border border-red-400 rounded-lg'>
          <p className="text-lg">Error</p>
          <p>{error.message}</p>
        </div>
    )
  }

  console.log(user)

  return (
      <div>
        <p>{JSON.stringify(data)}</p>
          {user.role === 'admin' && (
              <Button size='sm'><Pen className='size-4' /> Edit</Button>
          )}
      </div>
  )
}
