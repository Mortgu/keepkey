export interface BaseContactPerson {
    salutation: string;
    firstName: string;
    lastName: string;
    email?: string;
}

export interface ContactPerson extends BaseContactPerson {
    id: string;

    createdAt: Date;
    updatedAt: Date;
}

export interface BaseCustomer {
    customerId: string;
    companyName: string;
    email: string;
}

export interface CreateCustomer extends BaseCustomer {
    contactPersons: BaseContactPerson[];
}

export interface Customer extends BaseCustomer {
    id: string;

    contactPersons?: ContactPerson[];
    orders: Order[];

    createdAt: Date;
    updatedAt: Date;
}

export interface BaseUser {
    name: string;
    salutation: string;
    firstName: string;
    lastName: string;
    email: string;
}

export interface User extends BaseUser {
    id: string;

    emailVerified: boolean;
    role: string;

    customer?: Customer;
    orders?: Order[];
    offers?: Offer[];

    createdAt: Date;
}

export interface BaseContract {
    name: string;
    features: string[];
}

export interface Contract extends BaseContract {
    id: string;
    createdAt: Date;
}

export interface BaseProduct {
    name: string;
    description: string;
    link: string;
}

export interface ProductItem extends BaseProduct {
    id: string;

    productPricing: ProductItemPricing[],

    createdAt: Date;
    updatedAt: Date;
};

export interface CreatePricingProps {
    productId: string;
    pricing: {
        contractId: string;
        max_quantity: number;
        min_quantity: number;
        duration: number;
    }
}

export interface ProductItemPricing {
    contract: Contract;
    product: ProductItem,
    duration: number;

    max_quantity: number;
    min_quantity: number;

    price: number;
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

    employee: User;
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

/* OFFER */
export interface BaseOffer {
    voucherId: string;
    date: Date,
    paymentTerm: string;
    validUntil: Date | null;
    customerId: string;

    supplierId: string;

    requestFrom: Date | null;
}

export interface Offer extends BaseOffer {
    id: string;

    customer: Customer;

    net_amount: number;
    tax_rate: number;
    tax_amount: number;
    total_amount: number;

    offerPositions: OfferPosition[];
    customerContactPerson: ContactPerson;
}

export interface OfferPosition {
    offerId: String;
    offer: Offer;

    productId: String;
    product: ProductItem;

    contract: Contract;
    contractId: String;

    duration: number;
    quantity: number;

    optional: boolean;

    total_cents: number;
    tax_rate: number;

    createdAt: Date;
}

/* SUPPLIER */
export interface BaseSupplier {
    supplierId: string;
    name: string;
}

export interface Supplier extends BaseSupplier {
    id: string;
}