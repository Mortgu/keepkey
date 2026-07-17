import { PageWidth } from "@/components";
import CustomerList from "./-components/customer-list";

export default function CustomerPage({ }) {
    return (
        <PageWidth variant="none" className="flex">
            <CustomerList />
        </PageWidth>
    )
}