import {Fragment} from "react";

import {Plus} from "lucide-react";

import {useTranslation} from "react-i18next";
import SupplierListItem from "./supplier-list-item";
import SupplierModal from "./supplier-modal";
import type {Supplier} from "@/types";
import {Button} from "@/components";
import {useModal, useSupplierHook} from "@/hooks";

export default function SupplierList() {
    const {t} = useTranslation();

    const modal = useModal();
    const {suppliers} = useSupplierHook();

    return (
        <Fragment>
            <div className="grid gap-2">
                <div className="mb-4 flex items-center justify-between">
                    <h1 className="text-2xl font-medium flex items-center justify-center gap-4">
                        {t("section.suppliers")}
                    </h1>
                    <Button onClick={() => modal.open()} size="sm">
                        Erstellen <Plus className="size-4"/>
                    </Button>
                </div>

                {suppliers.map((supplier: Supplier) => (
                    <SupplierListItem key={supplier.id} supplier={supplier}/>
                ))}
            </div>

            {modal.isOpen && (
                <SupplierModal key={modal.key} onClose={modal.close}/>
            )}
        </Fragment>
    );
}
