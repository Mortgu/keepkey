import Button from "@/components/button/button";

import { Plus } from "lucide-react";
import { useState } from "react";
import OfferModal from "./offer-modal";

export default function OfferList() {
    const [isOpen, setOpen] = useState<boolean>(false);

    return (
        <div className="">
            <div className='mb-4 flex items-center justify-between'>
                <h1 className='text-2xl font-medium flex items-center justify-center gap-4'>Angebote</h1>
                <Button onClick={() => setOpen(true)} size='sm'>Erstellen <Plus className='size-4' /></Button>
            </div>
            <div className='grid gap-2'>

            </div>

            <OfferModal isOpen={isOpen} onClose={() => setOpen(false)} />
        </div>
    )
}