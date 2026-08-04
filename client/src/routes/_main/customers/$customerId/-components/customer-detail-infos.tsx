import type { Customer } from "@keepit/schemas";

interface Props {
    customer: Customer;
}

export default function CustomerDetailPageInfos({ customer }: Props) {
    return (
        <div className="px-8 py-6">
            <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5 items-baseline text-sm">
                {customer.customerId && (
                    <>
                        <dt className="text-gray-400">Kunden-Nr.</dt>
                        <dd className="font-medium text-right font-mono">
                            {customer.customerId}
                        </dd>
                    </>
                )}
                <dt className="text-gray-400">E-Mail</dt>
                <dd className="font-medium text-right">{customer.email || "—"}</dd>
                <dt className="text-gray-400">Telefon</dt>
                <dd className="font-medium text-right">
                    {customer.phone || "—"}
                </dd>
                <dt className="text-gray-400">Adresse</dt>
                <dd className="font-medium text-right">
                    {[customer.street, [customer.zip, customer.city].filter(Boolean).join(" ")]
                        .filter(Boolean)
                        .join(", ") || "—"}
                </dd>
                <dt className="text-gray-400">Land</dt>
                <dd className="font-medium text-right">{customer.country}</dd>
                <dt className="text-gray-400">Sprache</dt>
                <dd className="font-medium text-right">{customer.language}</dd>
                <dt className="text-gray-400">Bestellungen</dt>
                <dd className="font-medium text-right">
                    {customer.orders.length}
                </dd>
                <dt className="text-gray-400">Jahresumsatz</dt>
                <dd className="font-medium text-right">
                </dd>
            </dl>
        </div>
    )
}