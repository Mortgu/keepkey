import { Loader } from "lucide-react";

import { useTranslation } from "react-i18next";
import useOfferForm from "../../-hooks/use-offer-form";
import FormOfferModal from "./offer/offer-form";

import WorkloadOfferModalSection from "./offer/workload/workloads";
import FlatrateOfferModalSection from "./offer/flatrate/flatrates";
import DiscountOfferModalSection from "./offer/discount/discounts";
import type { Offer } from '@keepit/schemas';
import {
    Button, ModalDialog
} from "@/components";


interface OfferModalProps {
    closeFn: () => void;
    currentOffer: Offer | undefined;
    preselectedCustomerId?: string;
}

export default function ExtensionModal(props: OfferModalProps) {
    const { closeFn, currentOffer, preselectedCustomerId } = props;
    const isEdit = currentOffer !== undefined;

    const { t } = useTranslation();

    const { form, customerId, quoteIdLocked, isLoadingQuoteId, quoteIdCloudChecked } =
        useOfferForm({ currentOffer, closeFn, preselectedCustomerId });

    return (
        <ModalDialog onClose={closeFn}>
            <ModalDialog.Header>
                <div className="flex items-center justify-between w-full mr-2">
                    <h1 className="text-lg">
                        Lizenzerweiterung
                    </h1>
                </div>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <div className="grid gap-4">

                    <FormOfferModal
                        form={form}
                        quoteIdLocked={quoteIdLocked}
                        isLoadingQuoteId={isLoadingQuoteId}
                        quoteIdCloudChecked={quoteIdCloudChecked}
                    />

                    <WorkloadOfferModalSection
                        customerId={customerId}
                        currentOffer={currentOffer}
                        form={form}
                    />

                    <FlatrateOfferModalSection form={form} />

                    <DiscountOfferModalSection form={form} />

                </div>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <div className="w-full flex items-center justify-between">
                    <div>

                    </div>

                    <div className="flex gap-2">
                        <Button variant="border" size="sm" type="button" onClick={closeFn}>
                            {t("button.cancel")}
                        </Button>

                        <form.Subscribe selector={(s) => [s.canSubmit, s.isSubmitting]} children={([canSubmit, isSubmitting]) => (
                            <Button form="offer-modal-form" disabled={!canSubmit} type="submit" size="sm">
                                {isSubmitting && <Loader className="size-4 animate-spin" />}
                                {t("button.save")}
                            </Button>
                        )} />


                    </div>
                </div>
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
