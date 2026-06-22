import {ModalDialog} from "@/components";

interface TariffConfigModalProps {
    onClose: () => void;
}

export default function TariffConfigModal({onClose}: TariffConfigModalProps) {
    return (
        <ModalDialog onClose={onClose}>

        </ModalDialog>
    );
}
