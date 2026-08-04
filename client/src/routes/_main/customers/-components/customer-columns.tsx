import type { Customer } from "@keepit/schemas";

export interface CustomerTableRow {
    id: string;
    name: string;
    email: string;
    customer: Customer;
    contacts: Array<string>;
    revenue: number;
    createdAt: string;
}

export const initials = (name: string) =>
    name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");

export function Avatar({ name, size = 30 }: { name: string; size?: number }) {
    return (
        <span className="rounded-full bg-[#E6F2EC] text-(--primary) flex items-center justify-center font-semibold shrink-0"
            style={{ width: size, height: size, fontSize: size === 30 ? 12 : 10.5 }}>
            {initials(name)}
        </span>
    );
}