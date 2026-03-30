export interface User {
    id: string;
    name: string;

    salutation: string;
    firstName: string;
    lastName: string;

    email: string;
    emailVerified: boolean;

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

    createdAt: Date;
    updatedAt: Date;
};

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
