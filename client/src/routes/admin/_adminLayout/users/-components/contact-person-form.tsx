import Button from '@/components/button/button';
import Input from '@/components/inputs/input';
import { useEffect, useState } from 'react';
import { z } from 'zod';

const contactPersonSchema = z.object({
    salutation: z.string().min(1, ''),
    firstName: z.string().min(1, ''),
    lastName: z.string().min(1, ''),
    email: z.string().min(1, ''),
});

export default function ContactPersonForm({ }) {
    const [salutation, setSalutation] = useState<String>('');
    const [firstName, setFirstName] = useState<String>('');
    const [lastName, setLastName] = useState<String>('');
    const [email, setEmail] = useState<String>('');

    useEffect(() => {
        /*  contactPersonSchema.parse({
              salutation, firstName, lastName, email,
          });
  
        */
    }, [salutation, firstName, lastName, email])

    return (
        <div className='bg-gray-100 w-full grid gap-3 border border-gray-200 p-2 rounded-md'>
            <div className='flex items-center gap-3'>
                <div className='flex-1'>
                    <label className='text-sm text-gray-600'>Anrede</label>
                    <Input onChange={(e) => setSalutation(e.target.value)} className='bg-white' />
                </div>

                <div className='flex-1'>
                    <label className='text-sm text-gray-600'>Vorname</label>
                    <Input onChange={(e) => setFirstName(e.target.value)} className='bg-white' />
                </div>

                <div className='flex-1'>
                    <label className='text-sm text-gray-600'>Nachname</label>
                    <Input className='bg-white' />
                </div>
            </div>
            <div className='flex'>
                <div className='flex-1'>
                    <label className='text-sm text-gray-600'>E-Mail Adresse</label>
                    <Input className='bg-white' />
                </div>
            </div>

            <div className='flex gap-2 ml-auto mt-3'>
                <Button type='button' variant="secondary" size='sm' onClick={() => { }}>Abbrechen</Button>
                <Button type='button' size='sm' onClick={() => { }}>Speichern</Button>
            </div>
        </div>
    )
}