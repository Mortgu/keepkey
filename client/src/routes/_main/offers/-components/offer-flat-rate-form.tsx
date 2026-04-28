import { useState } from 'react';
import { useFlatRates } from '@/hooks/flatrate';
import Button from '@/components/button/button';
import Input from '@/components/inputs/input';
import type {FlatRate} from "@/data/types.ts";

interface Props {
    flatRates: FlatRate[];
    onSave: (data: { flatRateId: string, quantity: number }) => void;
    onCancel: () => void;
}

export default function OfferFlatRateForm({ flatRates, onSave, onCancel }: Props) {
    const [flatRateId, setFlatRateId] = useState<string>(flatRates[0]?.id ?? '');
    const [flatRate, setFlatRate] = useState<FlatRate | null>(flatRates[0] ?? null);
    const [quantity, setQuantity] = useState<number>(1);

    const [error, setError] = useState<string | null>(null);

    const selectClass = 'w-full rounded-lg border border-(--border) bg-white transition-all duration-200 px-3 py-2 text-sm outline-none focus:bg-gray-100';

    const handleSubmit = () => {
        onSave({ flatRateId, quantity });
    }

    return (
        <div className='bg-(--subtle-50) w-full grid gap-3 border border-(--border) p-2 rounded-md'>
            <div className='flex items-end gap-3'>
                <div className='flex-3 grid gap-1'>
                    <label className='text-sm text-gray-600'>Pauschale</label>
                    <select value={flatRates[0].id} onChange={(e) => setFlatRateId(e.target.value)} className={selectClass}>
                        {flatRates.map((p) => (
                            <option onSelect={() => setFlatRate(p)} key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className='flex-1 grid gap-1'>
                    <label className='text-sm text-gray-600'>Anzahl</label>
                    <Input type='number' className='bg-white' value={quantity} onChange={(e) => setQuantity(parseInt(e.target.value))} />
                </div>


            </div>

            {error && <p className='text-sm text-red-400'>{error}</p>}

            <div className='flex items-center justify-end gap-2'>
                <div className='flex gap-2'>
                    <Button type='button' variant='secondary' size='sm' onClick={onCancel}>Abbrechen</Button>
                    <Button type='button' size='sm' onClick={handleSubmit}>Hinzufügen</Button>
                </div>
            </div>
        </div>

    );
}
