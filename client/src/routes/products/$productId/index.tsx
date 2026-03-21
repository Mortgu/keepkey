import { createFileRoute } from '@tanstack/react-router'
import {useQuery} from "@tanstack/react-query";
import {getProduct } from "@/data/products.ts";
import {Loader} from "lucide-react";

export const Route = createFileRoute('/products/$productId/')({
  loader: async ({ params }) => {
    return getProduct(params.productId)
  },
  component: RouteComponent,
})

function RouteComponent() {
  const { productId } = Route.useParams();

  console.log(productId);

  const { data, isPending, error } = useQuery({
    queryKey: ['product'],
    queryFn: () => getProduct(productId),
  });

  if (isPending) {
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

  return (
      <div>{JSON.stringify(data)}</div>
  )
}
