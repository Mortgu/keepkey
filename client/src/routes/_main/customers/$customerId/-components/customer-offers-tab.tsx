import OfferCard from "../../../offers/-components/card/offer-card";
import OfferModal from "../../../offers/-components/modals/offer/offer-modal";
import type { Offer } from "@keepit/schemas";
import type { OfferFormTypes } from "../../../offers/-components/modals/offer/offer-form";
import { ListSkeleton, OfferCardSkeleton, RouteError } from "@/components";
import { useOffers } from "@/hooks/offers/offer-hooks";
import { useModal } from "@/hooks";

interface Props {
    customerId: string;
}

export default function CustomerOffersTab({ customerId }: Props) {
    const { items: offers, isPending, error } = useOffers({ companyIds: [customerId] });
    const editModal = useModal<Offer>();

    if (error) return <RouteError error={error} />;
    if (isPending) return <ListSkeleton rows={3} skeleton={<OfferCardSkeleton />} />;

    if (offers.length === 0) {
        return <p className="text-sm text-(--text-secondary) py-4">Keine Angebote.</p>;
    }

    return (
        <>
            <div className="grid gap-2">
                {offers.map((offer) => (
                    <OfferCard
                        key={offer.id}
                        offer={offer}
                        onEdit={(_type: OfferFormTypes, offer: Offer) => editModal.open(offer)}
                    />
                ))}
            </div>

            {editModal.isOpen && (
                <OfferModal
                    key={editModal.key}
                    closeFn={editModal.close}
                    currentOffer={editModal.data ?? undefined}
                />
            )}
        </>
    );
}
