import { tv } from "tailwind-variants";
import type { Customer } from "@keepit/schemas";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
    customer: Customer;
}

const styles = tv({
    base: 'text-sm bg-(--page-bg) border-(--border) px-4 py-2',
    slots: {
        base: 'text-sm bg-(--page-bg) border-(--border) px-4 py-2',
        dt: 'border-t border-b border-l rounded-tl-md rounded-bl-md text-gray-500',
        dd: 'border-t border-r border-b rounded-tr-md rounded-br-md text-right text-(--text) font-medium'
    }
})

export default function CustomerGeneralTab({ customer }: Props) {
    const css = styles();
    console.log(customer)

    return (
        <div>

            <dl className="grid grid-cols-[auto_1fr] gap-y-2.5 items-baseline">
                <dt className={cn(css.base(), css.dt())}>Kunden-Nr.</dt>
                <dd className={cn(css.base(), css.dd())}>
                    {customer.customerId ?? '-'}
                </dd>
                <dt className={cn(css.base(), css.dt())}>E-Mail</dt>
                <dd className={cn(css.base(), css.dd())}>{customer.email || "—"}</dd>
                <dt className={cn(css.base(), css.dt())}>Telefon</dt>
                <dd className={cn(css.base(), css.dd())}>
                    {customer.phone || "—"}
                </dd>
                <dt className={cn(css.base(), css.dt())}>Adresse</dt>
                <dd className={cn(css.base(), css.dd())}>
                    {[customer.street, [customer.zip, customer.city].filter(Boolean).join(" ")]
                        .filter(Boolean)
                        .join(", ") || "—"}
                </dd>
                <dt className={cn(css.base(), css.dt())}>Land</dt>
                <dd className={cn(css.base(), css.dd())}>{customer.country}</dd>
                <dt className={cn(css.base(), css.dt())}>Sprache</dt>
                <dd className={cn(css.base(), css.dd())}>{customer.language}</dd>
                <dt className={cn(css.base(), css.dt())}>Bestellungen</dt>
                <dd className={cn(css.base(), css.dd())}>
                    {customer._count.offers}
                </dd>
                <dt className={cn(css.base(), css.dt())}>Erstellt</dt>
                <dd className={cn(css.base(), css.dd())}>
                    {formatDate(customer.createdAt)}
                </dd>
            </dl>

        </div>
    )
}