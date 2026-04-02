import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_main/test')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <div className="grid gap-5 max-w-225 m-0">

            <div className="flex justify-between">
                <div className='grid h-fit gap-8'>

                    <div className='text-[10px] flex gap-1 border-b w-fit min-w-fit h-fit'>
                        <p>dignum GmbH •</p>
                        <p>Peterhofstr. 5 •</p>
                        <p>86438 Kissing •</p>
                        <p>Germany</p>
                    </div>

                    <div className="text-[13px]">
                        <p>CompanyName</p>
                        <p>ContactPerson</p>
                        <p>Street</p>
                        <p>PlzCode City</p>
                    </div>
                </div>

                <div className="">
                    <table className="border border-collapse table-fixed">
                        <tr className='border'>
                            <th className="py-1 px-2 float-left">ANGEBOT</th>
                        </tr>
                        <tr className=''>
                            <td className='border px-2'>Beleg-Nr.:</td>
                            <td className='border px-2'>AG250XXX</td>
                        </tr>
                        <tr>
                            <td className='border px-2'>Datum:</td>
                            <td className='border px-2'>Date</td>
                        </tr>
                        <tr>
                            <td className='border px-2'>Zahlungsbedingung</td>
                            <td className='border px-2'>30 Tage</td>
                        </tr>
                        <tr>
                            <td className='border px-2'>Angebot gültig bis:</td>
                            <td className='border px-2'></td>
                        </tr>
                        <tr>
                            <td className='border px-2'>Kunden-Nr.</td>
                            <td className='border px-2'></td>
                        </tr>
                        <tr>
                            <td className='border px-2'>Lieferanten-Nr.</td>
                            <td className='border px-2'></td>
                        </tr>
                        <tr>
                            <td className='border px-2'>Ihre Anfrage vom:</td>
                            <td className='border px-2'></td>
                        </tr>
                        <tr>
                            <td className='border px-2'>Ihr Ansprechpartner</td>
                            <td className='border px-2'></td>
                        </tr>
                        <tr>
                            <td className='border px-2'>Unser Ansprechpartner</td>
                            <td className='border px-2'></td>
                        </tr>
                    </table>
                </div>
            </div>

            <div className='grid gap-4'>
                <h1 className='text-lg font-semibold'>Keepit SaaS-Backup für [products]</h1>
                <p className='text-md'>Sehr geehrte(r) [Kunde],</p>

                <p>hiermit senden wir Ihnen wie besprochen unser Angebot zur Einrichtung einer SaaS-Backup Lösung für Ihre [products] Umgebung:</p>
            </div>

        </div>
    );
}
