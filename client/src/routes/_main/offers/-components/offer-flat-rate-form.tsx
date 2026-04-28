import type { FlatRateBase } from '@/data/types';
import { useState } from 'react';
import { useFlatRates } from '@/hooks/flatrate';
import { z } from 'zod';
import Checkbox from '@/components/inputs/checkbox';
import Button from '@/components/button/button';
import Input from '@/components/inputs/input';

interface Props {
    onSave: (data: FlatRateBase) => void;
    onCancel: () => void;
}

const flatRateSchema = z.object({
    name: z.string(),
    quantity: z.number(),
})

export default function OfferFlatRateForm({ onSave, onCancel }: Props) {
    const [flatrate, setFlatrate] = useState<FlatRateBase>();
    const [error, setError] = useState<string | null>(null);
    const { flatrates } = useFlatRates();

    const selectClass = 'w-full rounded-lg border border-(--border) bg-white transition-all duration-200 px-3 py-2 text-sm outline-none focus:bg-gray-100';

    return (
        <div className='bg-(--subtle-50) w-full grid gap-3 border border-(--border) p-2 rounded-md'>
            <div className='flex items-end gap-3'>
                <div className='flex-3 grid gap-1'>
                    <label className='text-sm text-gray-600'>Pauschale</label>
                    <select value={flatrate?.name} onChange={(e) => { }} className={selectClass}>
                        {flatrates.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div className='flex-1 grid gap-1'>
                    <label className='text-sm text-gray-600'>Anzahl</label>
                    <Input type='number' value={0} onChange={(e) => { }}
                        className='bg-white' />
                </div>


            </div>

            {error && <p className='text-sm text-red-400'>{error}</p>}

            <div className='flex items-center justify-end gap-2'>
                <div className='flex gap-2'>
                    <Button type='button' variant='secondary' size='sm' onClick={onCancel}>Abbrechen</Button>
                    <Button type='button' size='sm' onClick={() => { }}>Hinzufügen</Button>
                </div>
            </div>
        </div>

    );
}
