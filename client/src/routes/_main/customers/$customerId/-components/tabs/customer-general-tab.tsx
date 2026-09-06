import { tv } from "tailwind-variants";
import type { Customer } from "@keepit/schemas";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
    customer: Customer;
}

const styles = tv({
    slots: {
        base: 'text-sm  border-(--border) px-4 py-2 border-b nth-last-1:border-none nth-last-2:border-none',
        dt: '',
        dd: 'text-right text-(--text) font-medium'
    }
})

export default function CustomerGeneralTab({ customer }: Props) {
    const css = styles();

    return (
        <div className="border border-(--border) rounded-md">

            <dl className="grid grid-cols-[auto_1fr] items-baseline">
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