export interface Address {
    id: string;
    street?: string;
    city?: string;
    plz?: string;
    phone?: string;
}

export interface ContactPerson {
    id: string;

    salutation: string;
    firstName: string;
    lastName: string;
    email?: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface Customer {
    id: string;
    customerId: string;

    salutation?: string;
    name: string;
    firstName?: string;
    lastName?: string;
    email?: string;

    userId?: string;

    address?: Address;
    contactPersons: ContactPerson[];
    orders: Order[];

    createdAt: Date;
    updatedAt: Date;
}

export interface User {
    id: string;
    name: string;

    salutation: string;
    firstName: string;
    lastName: string;

    email: string;
    emailVerified: boolean;

    role: string;

    customer?: Customer;

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
    customer: Customer;

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

export interface Offer {
    voucherId: string;
    date: Date,
    paymentTerm: string;
    validUntil: Date;
    customerId: string;

    supplier: Supplier;
    supplierId: string;

    requestFrom: string;
}

export interface Supplier {
    id: string;
    name: string;
}
