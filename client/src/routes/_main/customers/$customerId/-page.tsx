import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";
import { Route } from "./index";
import type { Offer } from "@keepit/schemas";
import { PageWidth, RouteError } from "@/components";
import { useCustomer, useModal } from "@/hooks";
import CustomerDetailPageHeader from "./-components/header";

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
        <PageWidth variant="none">
            <CustomerDetailPageHeader customer={customer} />
        </PageWidth>
    );
}
