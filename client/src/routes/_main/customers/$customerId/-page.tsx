import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Route } from "./index";
import type { Offer } from "@keepit/schemas";
import { Button, FilterTabBar, PageWidth, RouteError } from "@/components";
import { useCustomer, useModal } from "@/hooks";
import { formatDate } from "@/lib/format";
import { Plus } from "lucide-react";

const TABS = [
    { value: "offers", label: "Angebote" },
    { value: "orders", label: "Bestellungen" },
    { value: "invoices", label: "Rechnungen" },
];

export default function CustomerDetailPage() {
    const { customerId } = Route.useParams();
    const { tab } = Route.useSearch();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const { customer, isPending, error } = useCustomer(customerId);

    const offerModal = useModal<Offer>();
    const orderModal = useModal<null>();

    if (error) return <PageWidth><RouteError error={error} /></PageWidth>;
    if (isPending || !customer) return <PageWidth><div className="p-4">Lädt…</div></PageWidth>;

    return (
        <PageWidth>
            <div className="grid gap-4">
                <div className="flex items-center gap-4 bg-(--page-bg) rounded-md p-4">
                    <div className="grid gap-1 ">
                        <p className="text-lg ">{customer.companyName}</p>
                        <p className="text-sm text-gray-400">{formatDate(customer.createdAt)}</p>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <FilterTabBar
                        tabs={TABS}
                        value={tab}
                        onChange={(value) => navigate({ to: "/customers/$customerId", params: { customerId }, search: { tab: value as "offers" | "orders" | "invoices" }, replace: true })}
                    />

                    <div className="flex items-center gap-2">
                        {tab === "offers" && (
                            <Button onClick={() => offerModal.open()} size="sm">
                                {t("button.create")} <Plus className="size-4" />
                            </Button>
                        )}
                        {tab === "orders" && (
                            <Button onClick={() => orderModal.open()} size="sm">
                                {t("button.create")} <Plus className="size-4" />
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </PageWidth>
    );
}
