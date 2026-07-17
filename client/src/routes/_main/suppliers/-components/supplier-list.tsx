import {useTranslation} from "react-i18next";
import SupplierListItem from "./supplier-list-item";
import SupplierModal from "./supplier-modal";
import {ListPage} from "@/components";
import {useModal, useSupplierHook} from "@/hooks";

export default function SupplierList() {
    const {t} = useTranslation();

    const modal = useModal();
    const {suppliers, isPending, error} = useSupplierHook();

    return (
        <ListPage
            title={t("section.suppliers")}
            items={suppliers}
            isPending={isPending}
            error={error}
            keyOf={(s) => s.id}
            createLabel={t("button.create")}
            onCreate={() => modal.open()}
            renderItem={(supplier) => (
                <SupplierListItem supplier={supplier}/>
            )}
        >
            {modal.isOpen && (
                <SupplierModal key={modal.key} onClose={modal.close}/>
            )}
        </ListPage>
    );
}
