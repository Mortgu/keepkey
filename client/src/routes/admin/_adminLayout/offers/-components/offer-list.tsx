import Button from "@/components/button/button";
import { FileText, Pen, Plus, Trash } from "lucide-react";
import { useMemo, useState } from "react";
import OfferModal from "./offer-modal";
import { useOffer } from "@/hooks/offer";
import type { Offer, OfferPosition } from "@/data/types";
import { SortDropdown } from "@/components/filters";

const options = [
    { value: 'date-desc', label: 'Date – newest first' },
    { value: 'date-asc', label: 'Date – oldest first' },
    { value: 'name-asc', label: 'Name – A to Z' },
    { value: 'name-desc', label: 'Name – Z to A' },
];

export default function OfferList() {
    const [isOpen, setOpen] = useState<boolean>(false);
    const [sort, setSort] = useState<string>(options[0].value);

    const { offers, deleteOffer } = useOffer();

    const sortedOffers = useMemo(() => {
        return [...(offers ?? [])].sort((a, b) => {
            switch (sort) {
                case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
                case 'date-asc': return new Date(a.date).getTime() - new Date(b.date).getTime();
                case 'name-asc': return a.voucherId.localeCompare(b.voucherId);
                case 'name-desc': return b.voucherId.localeCompare(a.voucherId);
                default: return 0;
            }
        });
    }, [offers, sort]);

    const handleDeleteOffer = (id: string) => {
        if (confirm("Angebot löschen?")) {
            deleteOffer({ id });
        } else {

        }
    }

    return (
        <div className="">
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium'>Angebote</h1>
                <div className="flex items-center gap-2">
                    <SortDropdown value={sort} onChange={setSort} options={options} />
                    <Button onClick={() => setOpen(true)} size='sm'>Erstellen <Plus className='size-4' /></Button>
                </div>
            </div>


            <div className='grid gap-2'>
                {sortedOffers.map((offer: Offer) => (
                    <div key={offer.id} className='grid border border-(--border) rounded-md overflow-hidden'>

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
                                        <span>{ } €</span>
                                        <span className='w-20 text-right font-medium text-gray-700'>{pos.totalPrice.toFixed(2)} €</span>
                                    </div>
                                </div>
                            ))}

                            <div className='flex items-center justify-between px-3 py-2 text-sm font-medium'>
                                <span className=''>Gesamt</span>
                                <span>{offer.offerPositions.reduce((sum, pos) => sum + pos.totalPrice, 0).toFixed(2)} €</span>
                            </div>
                        </div>

                        {/* Dokumente */}
                        <div className='flex items-center gap-2 px-3 py-2 bg-(--page-bg) border-t border-(--border)'>

                            <Button variant='secondary' size='sm' icon={<FileText className='size-3.5' />}>
                                DOCX
                            </Button>

                            <Button variant='secondary' size='sm' icon={<FileText className='size-3.5' />}>
                                PDF
                            </Button>
                        </div>

                    </div>
                ))}
            </div>

            <OfferModal open={isOpen} cancelFn={() => setOpen(false)} />
        </div>
    )
}