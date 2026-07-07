import { ContactPerson, Customer, OfferPosition, User } from "@prisma/client";
import { CustomerTemplate, CustomerTemplateSchema, EmployeeTemplate } from "../../schemas/templates/invoice-template-schema.js";

export function groupOfferPositions(offerPositions: Array<OfferPosition>) {
    return Object.groupBy(offerPositions, p => `${p.productId}_${p.contractId}_${p.duration_months}`);
}

export function formatPositionGroups(groups: ReturnType<typeof groupOfferPositions>) {

}

export function formatTemplateCustomer(customer: Customer, contactPerson: ContactPerson): CustomerTemplate {
    const merged = Object.assign({}, customer, contactPerson, { fullName: [contactPerson.salutation, contactPerson.firstName, contactPerson.lastName].filter(Boolean).join(" ") });
    return CustomerTemplateSchema.parse(merged);

    /*return {
        id: customer.customerId,
        companyName: customer.companyName,
        firstName: contactPerson.firstName,
        lastName: contactPerson.lastName,
        salutation: contactPerson.salutation,

        phone: customer.phone,
        email: contactPerson.email,

        street: customer.street,
        zip: customer.zip,
        city: customer.city,
    }*/
}

export function formatTemplateEmployee(employee: User): EmployeeTemplate {
    return {
        firstName: employee.firstName,
        lastName: employee.lastName,
        salutation: employee.salutation,

        phone: employee.phone,
        email: employee.email,
    }
}