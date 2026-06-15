import {ModalDialog} from "@/components";

interface TariffProductsModalProps {
    onClose: () => void;
}

export default function TariffProductsModal({onClose}: TariffProductsModalProps) {
    return (
        <ModalDialog onClose={onClose}>

        </ModalDialog>
    );
}
