import { Input } from "@/components";

interface Props { };

export default function OfferRenewalModal({ }: Props) {
    return (
        <div className="flex items-center gap-4">
            <Input label="AG-Nummer" />
            <Input label="Angebot vom" type="date" />
            <Input label="Gültig bis" type="date" />
        </div>
    )
}