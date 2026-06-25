import { useState } from "react";
import type { OfferProductInput } from "../-components/modal-components/offer-product-form";
import { Button, PageWidth } from "@/components";
import { formatEur } from "@/utils/utils.ts";
import CreateOfferForm from "./-components/create-form";

export function CreateOfferPage() {
    const [view, setView] = useState('woche');
    const [offerProducts, setOfferProducts] = useState<Array<OfferProductInput>>(
        [],
    );

    return (
        <PageWidth variant="full">
            <section className="grid gap-10 h-full grid-cols-[1fr_400px]">
                <div>
                    <CreateOfferForm />
                </div>


                <div className="w-full h-full">


                    <div className="h-full bg-white border border-(--border)  shadow-xl rounded-xl overflow-hidden">
                        <div className="grid flex-1 w-full p-4 ">
                            <div className="grid gap-1">
                                <p className="text-md ">Beispiel AG</p>

                                <div className="flex items-center justify-between text-md">
                                    <p className="">Ansprechpartner Kunde</p>
                                    <p className="">Hans Beispiel</p>
                                </div>
                            </div>

                            <hr className="my-4 border-(--border)" />

                            <div className="grid gap-2">
                                <p className="text-md text-(--fg-3) ">Zusammenfassung</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-md">Wiederkehrend</p>
                                    <p className="text-md font-semibold">{formatEur(20000)} <span
                                        className="text-(--fg-2) font-medium">/ Monat</span></p>
                                </div>
                                <div className="flex items-center justify-between">
                                    <p className="text-md">Einmalig</p>
                                    <p className="text-md font-semibold">{formatEur(20000)}</p>
                                </div>
                            </div>

                            <hr className="my-4 border-(--border)" />

                            <div className="flex items-center justify-between text-lg">
                                <p className="text-md text-(--fg-3)">Gesamt</p>
                                <p className="text-md font-semibold">{formatEur(999999)}</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-2 flex-1 w-full p-4">
                            <Button className="flex-1" size="sm" variant="secondary">Abbrechen</Button>
                            <Button className="flex-1" size="sm">Speichern</Button>
                        </div>

                    </div>
                </div>
            </section>
        </PageWidth>
    );
}
