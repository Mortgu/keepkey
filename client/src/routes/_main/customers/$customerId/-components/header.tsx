import { Link } from "@tanstack/react-router";
import { t } from "i18next";
import { ArrowLeft } from "lucide-react";
import type { Customer } from "@keepit/schemas";
import { Button } from "@/components";

interface Props {
    customer: Customer;
    onEdit: (customer: Customer) => void;
}

export default function CustomerDetailPageHeader({ customer, onEdit }: Props) {

    return (
        <div className="grid gap-4 px-8 py-6 border-b border-(--border)">
            <div className="flex items-center justify-between gap-4">
                <Link to="/customers" className="h-fit flex items-center">
                    <Button variant="ghost" size="sm" icon={<ArrowLeft size={20} />} iconOnly />
                </Link>
                <div className="flex-1 grid gap-1">
                    <p className="flex items-center gap-1 font-light text-sm text-gray-400">
                        <Link to="/customers" className="hover:underline">Customers</Link>
                        <span className="text-(--text)">/</span>
                        <span className="text-(--text)">{customer.companyName}</span>
                    </p>
                    <h1 className="font-medium text-xl">{customer.companyName}</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button size="sm" onClick={() => onEdit(customer)}>{t("customer.edit")}</Button>
                </div>
            </div>

        </div>
    )
}