export interface User {
    id: string;
    name: string;

    salutation: string;
    firstName: string;
    lastName: string;

    email: string;
    emailVerified: boolean;

    role: string;

    createdAt: Date;
}

export interface Contract {
    id: string;
    name: string;

    createdAt: Date;
}

export interface ProductItem {
    id: string;
    name: string;

    published: boolean,

    description: string;
    link: string;

    productPricing: ProductItemPricing[],

    createdAt: Date;
    updatedAt: Date;
};

export interface ProductItemPricing {
    contract: Contract;
    product: ProductItem,
    duration: number;

    max_quantity: number;
    min_quantity: number;
}

export interface ShoppingCartItem extends ProductItem {
    quantity: number;
    duration: number;
    contract: Contract;

    product: ProductItem;

    price: number;
}

export interface OrderPositionItem extends ShoppingCartItem {
    id: string;
    priceAtPurchase: number;
    currency: string;
    createdAt: Date;
}

export interface ShoppingCart {
    id: string;
    products: ShoppingCartItem[];
    total: number,
}

export interface Order {
    id: string;
    user: User;

    orderPositions: OrderPositionItem[],

    createdAt: Date;
}


export interface DocumentJob {
    id: string;
    orderId: string;
    type: string;
    status: 'pending' | 'processing' | 'completed' | 'failed';
    error?: string;
    createdAt: string;
    updatedAt: string;
}
