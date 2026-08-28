import { Search, Trash2 } from "lucide-react";
import { useState } from "react";
import type { ComponentSize, ComponentVariant } from "@/components";
import type { ReactNode } from "react";
import {
    Badge,
    Button,
    Checkbox,
    Dialog,
    Input,
    MultiDropdown,
    NumberField,
    Select,
    SortDropdown,
    Textarea,
} from "@/components";

const SIZES = ["xs", "sm", "md"] as const satisfies ReadonlyArray<ComponentSize>;
const VARIANTS = [
    "primary",
    "secondary",
    "border",
    "ghost",
    "link",
] as const satisfies ReadonlyArray<ComponentVariant>;

const SELECT_OPTIONS = [
    { value: "a", label: "Option A" },
    { value: "b", label: "Option B" },
];

const SORT_OPTIONS = [
    { value: "name_asc", label: "Name aufsteigend" },
    { value: "name_desc", label: "Name absteigend" },
    { value: "created_desc", label: "Neueste zuerst" },
];

const TAG_OPTIONS = [
    { value: "draft", label: "Entwurf", dot: "var(--warning)" },
    { value: "sent", label: "Versendet", dot: "var(--info)" },
    { value: "won", label: "Gewonnen", dot: "var(--success)" },
    { value: "lost", label: "Verloren", dot: "var(--destructive)" },
];

const LONG_OPTIONS = Array.from({ length: 40 }, (_, i) => ({
    value: String(i),
    label: `Eintrag ${i + 1}`,
}));

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-3">
            <div>
                <h2 className="text-h3">{title}</h2>
                {hint && <p className="text-small text-(--text-600)">{hint}</p>}
            </div>
            <div className="rounded-md border border-(--border) bg-white px-4">{children}</div>
        </section>
    );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
    return (
        <div className="grid grid-cols-[7rem_1fr] items-center gap-4 border-b border-(--border) py-3 last:border-b-0">
            <span className="text-caption text-(--text-600)">{label}</span>
            <div className="flex flex-wrap items-center gap-3">{children}</div>
        </div>
    );
}

/**
 * Komponenten-Matrix für die Entwicklung.
 *
 * Zweck ist der direkte Vergleich, nicht die Dokumentation einzelner
 * Komponenten: Kontrollen stehen je Größe nebeneinander, damit abweichende
 * Höhen, Fokusringe und Zustandsfarben sofort auffallen.
 *
 * Angebunden über die Route `/dev/components` — außerhalb von `_main`, also
 * ohne Layout und ohne Auth. TanStack Router splittet sie als eigenen Chunk,
 * der im Produktivbetrieb nie geladen wird.
 */
export function ComponentMatrix() {
    const [checked, setChecked] = useState(true);
    const [controlledOpen, setControlledOpen] = useState(false);
    const [sort, setSort] = useState("name_asc");
    const [tags, setTags] = useState<Array<string>>([]);

    // col-span-2: #root ist ein Grid `auto 1fr` (Sidebar + Inhalt); ohne Span
    // landet die Seite in der schmalen auto-Spalte.
    return (
        <div className="col-span-2 flex min-h-dvh flex-col gap-10 bg-(--page-bg) p-8">
            <header>
                <h1 className="text-h1">Komponenten-Matrix</h1>
                <p className="text-body text-(--text-600)">
                    Alle Kontrollen teilen sich Höhe, Schriftgröße, Fokusring und Zustandsfarben aus{" "}
                    <code>components/tokens.ts</code>. Abweichungen sind hier Fehler, keine Varianten.
                </p>
            </header>

            {/* 1 — Größen: deckt abweichende Höhen zwischen Kontrollen auf. */}
            <Section
                title="Größen"
                hint="Pro Zeile müssen alle Kontrollen exakt gleich hoch sein und auf derselben Grundlinie sitzen."
            >
                {SIZES.map((size) => (
                    <Row key={size} label={size}>
                        <Button size={size}>Button</Button>
                        <div className="w-44">
                            <Input size={size} placeholder="Input" />
                        </div>
                        <div className="w-44">
                            <Select size={size} options={SELECT_OPTIONS} defaultValue="a" />
                        </div>
                        <div className="w-44">
                            <NumberField size={size} defaultValue={42} />
                        </div>
                        <Checkbox size={size} label="Checkbox" checked={checked} onChange={() => setChecked(!checked)} />
                    </Row>
                ))}
            </Section>

            {/* 2 — Zustände: deckt abweichende Fokus-/Fehlerfarben auf. */}
            <Section
                title="Feldzustände"
                hint="Beim Durchtabben muss jeder Fokusring identisch aussehen; Fehler- und Warnfarbe müssen über alle Kontrollen übereinstimmen."
            >
                <Row label="normal">
                    <div className="w-52"><Input label="Input" placeholder="Wert" /></div>
                    <div className="w-52"><Select label="Select" options={SELECT_OPTIONS} defaultValue="a" /></div>
                    <div className="w-52"><NumberField label="NumberField" defaultValue={12} /></div>
                    <div className="w-52"><Textarea label="Textarea" placeholder="Text" /></div>
                </Row>
                <Row label="error">
                    <div className="w-52"><Input label="Input" error="Pflichtfeld" errorTooltip="Ohne Wert kein Speichern." /></div>
                    <div className="w-52"><Select label="Select" error="Pflichtfeld" options={SELECT_OPTIONS} placeholder="Wählen" /></div>
                    <div className="w-52"><NumberField label="NumberField" error="Zu klein" /></div>
                    <div className="w-52"><Textarea label="Textarea" error="Zu kurz" /></div>
                </Row>
                <Row label="warning">
                    <div className="w-52"><Input label="Input" warning="Ungewöhnlich" warningTooltip="Bitte gegenprüfen." /></div>
                    <div className="w-52"><Select label="Select" warning="Veraltet" options={SELECT_OPTIONS} defaultValue="a" /></div>
                    <div className="w-52"><NumberField label="NumberField" warning="Hoch" /></div>
                    <div className="w-52"><Textarea label="Textarea" warning="Sehr lang" /></div>
                </Row>
                <Row label="disabled">
                    <div className="w-52"><Input label="Input" placeholder="Wert" disabled /></div>
                    <div className="w-52"><Select label="Select" options={SELECT_OPTIONS} defaultValue="a" disabled /></div>
                    <div className="w-52"><NumberField label="NumberField" defaultValue={12} disabled /></div>
                    <div className="w-52"><Textarea label="Textarea" placeholder="Text" disabled /></div>
                </Row>
            </Section>

            {/* 3 — Button-Varianten: deckt Palettenfarben statt Token auf. */}
            <Section
                title="Button-Varianten"
                hint="Rot darf ausschließlich aus --destructive kommen, Grautöne aus --subtle-50 / --border / --text-600."
            >
                {VARIANTS.map((variant) => (
                    <Row key={variant} label={variant}>
                        <Button variant={variant}>Normal</Button>
                        <Button variant={variant} active>Aktiv</Button>
                        <Button variant={variant} danger icon={<Trash2 className="size-4" />}>Danger</Button>
                        <Button variant={variant} loading>Lädt</Button>
                        <Button variant={variant} disabled>Disabled</Button>
                        <Button variant={variant} iconOnly icon={<Search className="size-4" />} />
                    </Row>
                ))}
            </Section>

            <Section title="Badge" hint="Statusfarben kommen aus --success / --warning / --destructive / --info.">
                {SIZES.map((size) => (
                    <Row key={size} label={size}>
                        <Badge size={size} variant="GENERATED" />
                        <Badge size={size} variant="PENDING" />
                        <Badge size={size} variant="FAILED" />
                        <Badge size={size} variant="PROCESSING" />
                        <Badge size={size} variant="UPLOADING" />
                        <Badge size={size} variant="GENERATED" format="pdf" />
                        <Badge size={size} variant="GENERATED" count={3} />
                        <Badge size={size} variant="GENERATED" count={1} countVariant="error" />
                    </Row>
                ))}
            </Section>
            {/* 5 — Dialog: deckt abweichende Anatomie und fehlenden Fokus-Trap auf. */}
            <Section
                title="Dialog"
                hint="Alle Varianten teilen sich Header, Body und Footer aus dialog-styles.ts. Escape schließt; ein Klick auf den Backdrop schließt nur mit `dismissible`."
            >
                <Row label="Trigger innen">
                    <Dialog trigger={<Button size="sm">Öffnen (uncontrolled)</Button>}>
                        <Dialog.Header title="Dialog mit eigenem Trigger" description="Der Trigger steckt in der Dialog-Komponente." />
                        <Dialog.Body>
                            <p className="text-body">Kein `open`-State an der Call-Site nötig.</p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.Close render={<Button variant="border" size="sm">Schließen</Button>} />
                        </Dialog.Footer>
                    </Dialog>
                </Row>

                <Row label="Controlled">
                    <Button size="sm" variant="border" onClick={() => setControlledOpen(true)}>
                        Öffnen (externer Trigger)
                    </Button>
                    <Dialog open={controlledOpen} onOpenChange={setControlledOpen}>
                        <Dialog.Header title="Von außen gesteuert" />
                        <Dialog.Body>
                            <p className="text-body">`open` / `onOpenChange` — für useModal() oder Trigger außerhalb des Dialogs.</p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.Close render={<Button variant="border" size="sm">Schließen</Button>} />
                        </Dialog.Footer>
                    </Dialog>
                </Row>

                <Row label="dismissible">
                    <Dialog dismissible size="sm" trigger={<Button size="sm" variant="border">Backdrop-Klick schließt</Button>}>
                        <Dialog.Header title="Dismissible" />
                        <Dialog.Body>
                            <p className="text-body">Klick außerhalb schließt diesen Dialog — Standard ist das Gegenteil.</p>
                        </Dialog.Body>
                    </Dialog>
                </Row>

                <Row label="Toolbar">
                    <Dialog trigger={<Button size="sm" variant="border">Mit Toolbar</Button>}>
                        <Dialog.Header title="Liste mit Filterzeile" />
                        <Dialog.Toolbar>
                            <div className="w-52"><Input size="sm" placeholder="Suchen" /></div>
                            <Button size="sm">Neu</Button>
                        </Dialog.Toolbar>
                        <Dialog.Body>
                            <p className="text-body">Die Toolbar sitzt zwischen Header und scrollendem Body.</p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.Close render={<Button variant="border" size="sm">Schließen</Button>} />
                        </Dialog.Footer>
                    </Dialog>
                </Row>

                <Row label="Scroll + nested">
                    <Dialog trigger={<Button size="sm" variant="border">Langer Inhalt</Button>}>
                        <Dialog.Header title="Body scrollt, Header und Footer bleiben stehen" />
                        <Dialog.Body className="gap-2">
                            {Array.from({ length: 40 }, (_, i) => (
                                <p key={i} className="text-body">Zeile {i + 1}</p>
                            ))}
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog trigger={<Button size="sm" variant="border">Verschachtelt öffnen</Button>} size="sm">
                                <Dialog.Header title="Verschachtelter Dialog" />
                                <Dialog.Body>
                                    <p className="text-body">Der Eltern-Dialog skaliert zurück (data-nested-dialog-open).</p>
                                </Dialog.Body>
                            </Dialog>
                            <Dialog.Close render={<Button variant="border" size="sm">Schließen</Button>} />
                        </Dialog.Footer>
                    </Dialog>
                </Row>

                <Row label="Größen">
                    {(["sm", "md", "lg"] as const).map((size) => (
                        <Dialog key={size} size={size} trigger={<Button size="sm" variant="border">{size}</Button>}>
                            <Dialog.Header title={`Größe ${size}`} />
                            <Dialog.Body>
                                <p className="text-body">Breite kommt aus der size-Variante in dialog-styles.ts.</p>
                            </Dialog.Body>
                        </Dialog>
                    ))}
                </Row>
            </Section>

            {/* 6 — Select & Filter: deckt Clipping, Tastaturbedienung und abweichende Trigger-Höhen auf. */}
            <Section
                title="Select & Filter"
                hint="Alle drei teilen sich Popup und Item aus select-styles.ts. Der Trigger des Select ist ein Feld, der von MultiDropdown und SortDropdown ein Button — die Höhen kommen trotzdem aus denselben Tokens."
            >
                <Row label="Einfach">
                    <div className="w-52">
                        <Select label="Select" options={SELECT_OPTIONS} placeholder="Wählen" />
                    </div>
                    <SortDropdown value={sort} onChange={setSort} options={SORT_OPTIONS} />
                </Row>

                <Row label="Mehrfach">
                    <MultiDropdown label="Tags" options={TAG_OPTIONS} values={tags} onChange={setTags} />
                    <span className="text-caption text-(--text-600)">gewählt: {tags.join(", ") || "—"}</span>
                </Row>

                <Row label="Lange Liste">
                    <div className="w-52">
                        <Select label="40 Einträge" options={LONG_OPTIONS} placeholder="Wählen" />
                    </div>
                </Row>

                <Row label="Im Dialog">
                    <Dialog trigger={<Button size="sm" variant="border">Dialog mit Select</Button>}>
                        <Dialog.Header title="Popup darf über den Dialogrand hinaus" />
                        <Dialog.Body className="gap-4">
                            <Select label="Select" options={LONG_OPTIONS} placeholder="Wählen" />
                            <MultiDropdown label="Tags" options={TAG_OPTIONS} values={tags} onChange={setTags} />
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.Close render={<Button variant="border" size="sm">Schließen</Button>} />
                        </Dialog.Footer>
                    </Dialog>
                </Row>
            </Section>
        </div>
    );
}
