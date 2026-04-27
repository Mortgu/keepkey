/*
 * This interface is the base of what docxtemplater revieves as data
 */
export interface TemplateBaseData {
    voucherId: string;      // "Beleg-Nr."
    date: string;             // "Datum"
    paymentTerm: string;    // "Zahlungsbedingung:"
    validUntil: string;       // "Angebot gültig bis:"
    requestFrom: string;      // "Ihre Anfrage vom:"
    supplierId: string;     // "Lieferantennummer"

    customer: TemplateCustomerData;
    employee: TemplateEmployeeData;

    products: TemplateProductData[];

    positions: {
        names: string;
        includesOptionals: boolean;
        products: TemplatePositionData[];
    }
}

/* Extended interface for additional field only used in offers */
export interface TemplateOfferData extends TemplateBaseData { }

/* Extended interface for additional field only used in invoices */
export interface TemplateInvoiceData extends TemplateBaseData { }

/* Every field from a customer that is required in a generated file */
interface TemplateCustomerData {
    id: string;             // "Kunden-Nr."
    companyName: string;
    street: string;
    plz: string;
    city: string;

    fullName: string;
    salutation: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}

/* Every field from a employee/userq that is required in a generated file */
interface TemplateEmployeeData {
    fullName: string;
    salutation: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
}

export interface TemplateProductData {
    name: string;
    description: string;
    duration: string; // in Jahren
    duration_months: number; // in Jahren
    quantity: string;
    contract: TemplateContractData;
    pricePerUnit: string;
    totalPrice: string;
    optional: boolean;

    prices: {
        price_1: string;
        price_12: string;
        price_24: string;
        price_36: string;
    }
}

export interface TemplateContractData {
    name: string;
    features: string[];
}

export interface TemplatePositionData {
    contract: TemplateContractData;
    duration_months: string;
    names: string;
    products: any;
}