import Button from "@/components/button/button";
import type { Offer, OfferPosition } from "@/data/types";
import { useOffer } from "@/hooks/offer";
import { formatEur } from "@/utils/utils";
import { useQuery } from "@tanstack/react-query";
import { FileText, Pen, Trash } from "lucide-react";

type OfferListItemProps = {
    offer: Offer;
}

export default function OfferListItem({ offer }: OfferListItemProps) {
    const { deleteOffer } = useOffer();

    const { status, } = useQuery({
        queryKey: ["documentJobs"],
        queryFn: async () => {
            const response = await fetch(`http://localhost:3000/api/offers/${offer.id}/jobs`, {
                method: 'GET',
                credentials: 'include'
            });

            if (!response.ok) {
                return []
            }

            return await response.json();;
        },
        refetchInterval: (query) => {
            console.log(query);
            if (query.state.data?.status === "completed") {
                return false;
            }

            return 3000;
        }
    })

    const handleDeleteOffer = (id: string) => {
        if (confirm("Angebot löschen?")) {
            deleteOffer({ id });
        }
    }

    return (
        <div className='grid border border-(--border) rounded-md overflow-hidden'>

            {/* Header */}
            <div className='flex items-center justify-between border-b border-(--border) px-3 py-2'>
                <div className='flex items-center gap-4'>
                    <div>
                        <p className='text-base font-medium'>{offer.voucherId}</p>
                        <p className='text-sm text-gray-500'>{offer.customer.companyName} · {offer.customerContactPerson.firstName} {offer.customerContactPerson.lastName}</p>
                    </div>
                    <div className='hidden sm:block text-sm text-gray-500'>
                        {/*<p>Gültig bis: {formatDate(offer.validUntil)}</p>
                                    <p>Anfrage vom: {formatDate(offer.requestFrom)}</p>*/}
                    </div>
                </div>
                <div className="flex items-center">
                    <Button size="sm" variant="ghost" icon={<Pen className="size-4" />} iconOnly />
                    <Button onClick={() => handleDeleteOffer(offer.id)} size="sm" variant="ghost" icon={<Trash className="size-4" />} iconOnly />
                </div>
            </div>

            {/* Positionen */}
            <div>
                {offer.offerPositions.map((pos: OfferPosition, i) => (
                    <div key={i} className='flex items-center justify-between even:bg-gray-50 px-3 py-2'>
                        <div className='flex items-center gap-2'>
                            <p className='text-sm'>{pos.product.name}</p>
                            <p className='text-sm text-gray-400'>({pos.contract.name} / {String(pos.duration)} Jahr(e))</p>
                        </div>
                        <div className='flex items-center gap-4 text-sm text-gray-500'>
                            <span className='w-20 text-right font-medium text-gray-700'>{formatEur((pos.price_at_purchase * 12 * pos.duration))}</span>
                        </div>
                    </div>
                ))}

                <div className='flex items-center justify-between px-3 py-2 text-sm font-medium'>
                    <span className=''>Zwischensumme (Netto)</span>
                    <span>{formatEur(offer.net_amount)}</span>
                </div>
                <div className='flex items-center justify-between px-3 py-2 text-sm font-medium'>
                    <span className=''>+ Steuern</span>
                    <span>+ {formatEur(offer.tax_amount)}</span>
                </div>
                <div className='flex items-center justify-between px-3 py-2 text-sm font-medium'>
                    <span className=''>Gesamt (Brutto)</span>
                    <span>{formatEur(offer.total_amount)}</span>
                </div>
            </div>

            {/* Dokumente */}
            <div className='flex items-center gap-2 px-3 py-2 bg-(--page-bg) border-t border-(--border)'>

                <Button loading variant='secondary' size='sm' icon={<FileText className='size-3.5' />}>
                    DOCX
                </Button>

                <Button loading variant='secondary' size='sm' icon={<FileText className='size-3.5' />}>
                    PDF
                </Button>
            </div>

        </div>
    )
}