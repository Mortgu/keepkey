import ProductItem from "./product-item";
import type {Product} from "@/types";

type Props = {
    products: Product[];
}

export default function ProductList({products}: Props) {
    return products.map((product: Product, index: number) => (
        <ProductItem key={index} {...product} />
    ))
}
