import { Button } from "@/components";
import { formatDate } from "@/lib/format";
import { formatEur } from "@/utils/utils";
import { Accordion } from "@base-ui/react";
import type { Order } from "@keepit/schemas";
import { ChevronDown } from "lucide-react";

interface Props {
    order: Order;
}

export default function OrderCard({ order }: Props) {
    const { customer, customerContactPerson: ccp } = order;

    return (
        <div className="bg-white border border-(--border) rounded-md">
            <div className="flex items-center justify-between px-4 py-3 border-b border-(--border) relative">
                <div className="grid gap-1">
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2 text-md">
                            <span className="text-(--text) font-semibold">BE{order.orderId}</span>
                            <span className="text-(--text)">{customer.companyName}</span>
                        </div>
                    </div>


                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1 text-sm font-light">
                            <label className="text-(--text-secondary)">Kontakt:</label>
                            <p className="text-(--text)">
                                {ccp.salutation} {ccp.firstName} {ccp.lastName}
                            </p>
                        </div>

                        <div className="flex items-center gap-1 text-sm font-light">
                            <label className="text-(--text-secondary)">Angebots-Nr.</label>
                            <p className="text-(--text)">{order.offer.quoteId}</p>
                        </div>

                        <div className="flex items-center gap-1 text-sm font-light">
                            <label className="text-(--text-secondary)">Erstellt:</label>
                            <p className="text-(--text)">{formatDate(order.createdAt)}</p>
                        </div>

                        <div className="flex items-center gap-1 text-sm font-light">
                            <label className="text-(--text-secondary)">Gültig bis:</label>
                            <p className="text-(--text)">
                                {order.validUntil ? formatDate(order.validUntil) : "-"}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-end">
                    <p className="text-md font-mono font-medium">{formatEur(order.net_amount)}</p>
                    <p className="text-(--text-secondary) font-light text-sm">
                        Gesamtpreis
                    </p>
                </div>
            </div>

            <Accordion.Root multiple>
                <Accordion.Item>
                    <Accordion.Header>
                        <Accordion.Trigger className="w-full flex items-center justify-between py-2 px-4 bg-(--page-bg) border-b border-(--border)">
                            <p className="text-sm">Produkte</p>
                            <ChevronDown size={14} className="duration-100 ease-[ease-out] group-data-panel-open:rotate-360 rotate-270" />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Panel className="border-b border-(--border) px-4 py-2">
                        dadwa
                    </Accordion.Panel>
                </Accordion.Item>

                <Accordion.Item>
                    <Accordion.Header>
                        <Accordion.Trigger className="w-full flex items-center justify-between py-2 px-4 bg-(--page-bg) border-b border-(--border)">
                            <p className="text-sm">Produkte</p>
                            <ChevronDown size={14} />
                        </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Panel className="border-b border-(--border) px-4 py-2">
                        dadwa
                    </Accordion.Panel>
                </Accordion.Item>
            </Accordion.Root>

            <div className="flex items-center justify-between px-2 py-2 ">

                {/* Actions left */}
                <div className="flex items-center gap-2">
                    <Button
                        className="min-w-fit"
                        variant="primary"
                        size="xs"
                    >
                        Dokument generieren
                    </Button>
                </div>

                {/* Actions right */}
                <div className="flex items-center gap-2">

                </div>
            </div>

        </div>
    )
}