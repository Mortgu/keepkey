import {ModalDialog} from "@/components";

interface PricingModalProps {
    onClose: () => void;
}

export default function PricingModal({onClose}: PricingModalProps) {
    return (
        <ModalDialog onClose={onClose}>

        </ModalDialog>
    );
}
