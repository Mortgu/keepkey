import Button from '@/components/button/button';
import Checkbox from '@/components/inputs/checkbox';
import Input from '@/components/inputs/input';
import type { Contract, ProductItem } from '@/data/types';
import { useState } from 'react';

export type OfferProductInput = {
    productId: string;
    contractId: string;
    duration_months: number;
    quantity: number;
    optional: boolean;
};

const DURATIONS: { value: 12 | 24 | 36; label: string }[] = [
    { value: 12, label: '12 Monate' },
    { value: 24, label: '24 Monate' },
    { value: 36, label: '36 Monate' },
];

interface Props {
    products: ProductItem[];
    contracts: Contract[];
    onSave: (data: OfferProductInput) => void;
    onCancel: () => void;
}

export default function OfferProductForm({ products, contracts, onSave, onCancel }: Props) {
    const [productId, setProductId] = useState(products[0]?.id ?? '');
    const [contractId, setContractId] = useState(contracts[0]?.id ?? '');
    const [duration_months, setDurationMonths] = useState<OfferProductInput['duration_months']>(12);
    const [quantity, setQuantity] = useState(1);
    const [optional, setOptional] = useState<boolean>(false);
    const [error, setError] = useState('');

    const handleSave = () => {
        if (!productId) { setError('Bitte ein Produkt auswählen.'); return; }
        if (!contractId) { setError('Bitte einen Vertrag auswählen.'); return; }
        if (quantity < 1) { setError('Menge muss mindestens 1 sein.'); return; }
        onSave({ productId, contractId, duration_months, quantity, optional });
    };

    const selectClass = 'w-full rounded-lg border border-(--border) bg-white transition-all duration-200 px-3 py-2 text-sm outline-none focus:bg-gray-100';

    return (
        <div className='bg-(--subtle-50) w-full grid gap-3 border border-(--border) p-2 rounded-md'>
            <div className='flex items-end gap-3'>
                <div className='flex-2 grid gap-1'>
                    <label className='text-sm text-gray-600'>Produkt</label>
                    <select value={productId} onChange={(e) => setProductId(e.target.value)} className={selectClass}>
                        {products.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className='flex-2 grid gap-1'>
                    <label className='text-sm text-gray-600'>Vertrag</label>
                    <select value={contractId} onChange={(e) => setContractId(e.target.value)} className={selectClass}>
                        {contracts.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                </div>

                <div className='flex-1 grid gap-1'>
                    <label className='text-sm text-gray-600'>Laufzeit</label>
                    <select value={duration_months} onChange={(e) => setDurationMonths(Number(e.target.value) as OfferProductInput['duration_months'])} className={selectClass}>
                        {DURATIONS.map((d) => (
                            <option key={d.value} value={d.value}>{d.label}</option>
                        ))}
                    </select>
                </div>

                <div className='w-20 grid gap-1'>
                    <label className='text-sm text-gray-600'>Menge</label>
                    <Input
                        type='number'
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                        className='bg-white'
                    />
                </div>
            </div>

            {error && <p className='text-sm text-red-400'>{error}</p>}

            <div className='flex items-center justify-between gap-2'>
                <Checkbox label="Optional?" onChange={() => setOptional(!optional)} />
                <div className='flex gap-2'>
                    <Button type='button' variant='secondary' size='sm' onClick={onCancel}>Abbrechen</Button>
                    <Button type='button' size='sm' onClick={handleSave}>Hinzufügen</Button>
                </div>
            </div>
        </div>
    );
}
