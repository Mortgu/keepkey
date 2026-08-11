import { ModalDialog } from "@/components";
import type { Offer } from "@keepit/schemas";
import { useTranslation } from "react-i18next";

interface Props {
    offer: Offer;
    onClose: () => void;
}

export default function RenewalModal({ offer, onClose }: Props) {
    const { t } = useTranslation();

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">{t("renewal.title", { orderId: offer.quoteId })}</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>

            </ModalDialog.Content>
            <ModalDialog.Footer></ModalDialog.Footer>
        </ModalDialog>
    )
}