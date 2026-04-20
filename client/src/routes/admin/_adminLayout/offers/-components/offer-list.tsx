import Button from "@/components/button/button";

import { Plus } from "lucide-react";
import { useState } from "react";
import OfferModal from "./offer-modal";
import { useOffer } from "@/hooks/offer";
import type { Offer } from "@/data/types";

export default function OfferList() {
    const [isOpen, setOpen] = useState<boolean>(false);

    const { offers } = useOffer();

    return (
        <div className="">
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Angebote</h1>
                <Button onClick={() => setOpen(true)} size='sm'>Erstellen <Plus className='size-4' /></Button>
            </div>
            <div className='grid gap-2'>
                {offers.map((offer: Offer) => (
                    <div key={offer.id}>
                        {offer.paymentTerm}
                    </div>
                ))}
            </div>

            <OfferModal isOpen={isOpen} onClose={() => setOpen(false)} />
        </div>
    )
}