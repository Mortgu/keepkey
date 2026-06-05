import { Button, Input, ModalDialog, Select } from "@/components";
import { useContractHook, useTariffHook } from "@/hooks";
import { useState, type SyntheticEvent } from "react";

interface TariffConfigModalProps {
    onClose: () => void;
    tariffId: string;
}

export default function TariffConfigModal({ onClose, tariffId }: TariffConfigModalProps) {
    const { contracts } = useContractHook();
    const { addConfig, isAddingConfig } = useTariffHook();

    const [contractId, setContractId] = useState<string>(contracts[0]?.id ?? "");
    const [duration, setDuration] = useState<number>(12);
    const [min_quantity, setMin] = useState<number>(1);
    const [max_quantity, setMax] = useState<number | null>(null);
    const [price, setPrice] = useState<number>(0);

    const handleSubmit = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!contractId) return;
        await addConfig({
            tariffId,
            body: {
                contractId,
                duration,
                min_quantity,
                max_quantity: max_quantity ?? undefined,
                price,
            },
        });
        onClose();
    };

    return (
        <ModalDialog onClose={onClose}>
            <ModalDialog.Header>
                <h1 className="text-lg">Konfiguration hinzufügen</h1>
            </ModalDialog.Header>
            <ModalDialog.Content>
                <form id="tariff-config-form" onSubmit={handleSubmit} className="grid gap-3">
                    <label className="grid gap-1 text-sm">
                        Vertrag
                        <Select value={contractId} onChange={(e) => setContractId(e.target.value)}>
                            {contracts.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.name}
                                </option>
                            ))}
                        </Select>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        <label className="grid gap-1 text-sm">
                            Min
                            <Input type="number" value={min_quantity}
                                onChange={(e) => setMin(parseInt(e.target.value) || 0)} />
                        </label>
                        <label className="grid gap-1 text-sm">
                            Max
                            <Input type="number" value={max_quantity ?? ""}
                                onChange={(e) => setMax(e.target.value ? parseInt(e.target.value) : null)} />
                        </label>
                        <label className="grid gap-1 text-sm">
                            Laufzeit
                            <Input type="number" value={duration}
                                onChange={(e) => setDuration(parseInt(e.target.value) || 0)} />
                        </label>
                        <label className="grid gap-1 text-sm">
                            Preis (Cent)
                            <Input type="number" value={price}
                                onChange={(e) => setPrice(parseInt(e.target.value) || 0)} />
                        </label>
                    </div>
                </form>
            </ModalDialog.Content>
            <ModalDialog.Footer>
                <Button onClick={onClose} type="button" size="sm" variant="secondary">
                    Abbrechen
                </Button>
                <Button form="tariff-config-form" type="submit" size="sm"
                    disabled={!contractId || isAddingConfig} loading={isAddingConfig}>
                    Speichern
                </Button>
            </ModalDialog.Footer>
        </ModalDialog>
    );
}
