import {useState} from "react";
import {ArrowLeft} from "lucide-react";
import type {OfferProductInput} from "../-components/modal-components/offer-product-form";
import {Button, DEFAULT_LANGUAGE_OPTIONS, SegmentedButtonGroup, SegmentedLanguageToggle} from "@/components";
import {formatEur} from "@/utils/utils.ts";

export function CreateOfferPage() {
    const [view, setView] = useState('woche');
    const [offerProducts, setOfferProducts] = useState<Array<OfferProductInput>>(
        [],
    );

    return (
        <section className="grid gap-10">
            {/* Head */}
            <div className="flex items-center gap-4">
                <Button variant="ghost" icon={<ArrowLeft className="size-5"/>} iconOnly/>

                <div className="grid gap-2">
                    <h1 className="text-xl font-medium">
                        Angebot erstellen
                    </h1>
                    <p className="text-(--text-secondary) text-md">
                        Eckdaten erfassen, Produkte konfigurieren und kundenspezifische Preise hinterlegen.
                    </p>
                </div>
            </div>

            {/* Body */}
            <div className="grid items-start justify-between gap-6 grid-cols-[1fr_1px_0.5fr]">
                <div className="flex-1 grid gap-5">
                    <p className="text-lg font-semibold">Eckdaten</p>

                    <div className="flex gap-4">


                        <SegmentedButtonGroup
                            value={view}
                            onChange={setView}
                            options={[
                                {value: '30', label: '30 Tage'},
                                {value: '14', label: '14 Tage'},
                                {value: '0', label: 'Sofort'},
                            ]}
                        />


                        <div className="grid gap-1">
                            <SegmentedLanguageToggle
                                options={DEFAULT_LANGUAGE_OPTIONS}
                                value="DE"
                                onChange={(lng) => {
                                }}
                            />
                        </div>

                    </div>

                </div>
                <div className="bg-(--border) w-full h-full"></div>
                <div className="grid flex-1 w-full">
                    <div className="grid gap-1">
                        <p className="text-(--text-secondary) text-md ">Beispiel AG</p>

                        <div className="flex items-center justify-between text-md">
                            <p className="">Ansprechpartner Kunde</p>
                            <p className="">Hans Beispiel</p>
                        </div>
                    </div>

                    <hr className="my-4 border-(--border)"/>

                    <div className="grid gap-2">
                        <p className="text-md text-(--text-secondary)">Zusammenfassung</p>
                        <div className="flex items-center justify-between">
                            <p className="text-md">Wiederkehrend</p>
                            <p className="text-md font-semibold">{formatEur(20000)} <span
                                className="text-(--text-secondary) font-medium">/ Monat</span></p>
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-md">Einmalig</p>
                            <p className="text-md font-semibold">{formatEur(20000)}</p>
                        </div>
                    </div>

                    <hr className="my-4 border-(--border)"/>

                    <div className="flex items-center justify-between text-lg">
                        <p className="text-md text-(--text-secondary)">Gesamt</p>
                        <p className="text-md font-semibold">{formatEur(999999)}</p>
                    </div>

                </div>
            </div>
        </section>
    );
}
