import { ModalDialog } from "@/components";

interface Props {
    closeFn: () => void;
};

export default function InvoiceModal({ closeFn }: Props) {
    return (
        <ModalDialog onClose={closeFn}>
            <ModalDialog.Header>daw</ModalDialog.Header>
        </ModalDialog>
    )
}