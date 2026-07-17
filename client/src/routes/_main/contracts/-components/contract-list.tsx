import { useTranslation } from "react-i18next";
import ContractModal from "./contract-modal";
import ContractListItem from "./contract-item";

import { ListPage } from "@/components";
import { useModal } from "@/hooks";
import { useContracts } from "@/hooks/contracts/contract-hooks";

export default function ContractList() {
    const { t } = useTranslation();

    const { contracts, isPending, error } = useContracts();

    const modal = useModal();

    return (
        <ListPage
            title={t("section.contracts")}
            items={contracts}
            isPending={isPending}
            error={error}
            showCount
            keyOf={(c) => c.id}
            createLabel={t("button.create")}
            onCreate={() => modal.open()}
            renderItem={(contract) => (
                <ContractListItem contract={contract} />
            )}
        >
            {modal.isOpen && (
                <ContractModal key={modal.key} onClose={modal.close} />
            )}
        </ListPage>
    );
}
