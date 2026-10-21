import { afterEach, describe, expect, it, vi } from "vitest";
import { convertDocxToPdf } from "./docx-to-pdf.js";

/**
 * `convertDocxToPdf` ruft Gotenberg über HTTP auf — diese Tests stubben
 * `fetch` global und prüfen den Vertrag an dieser Grenze: gesendete DOCX
 * rein, PDF-Bytes raus, und ein klarer Fehlschlag bei nicht-2xx-Antwort oder
 * Timeout. Interna des Requests (Header, genaue FormData-Struktur) sind
 * bewusst nicht Gegenstand — nur was Gotenberg sieht und zurückgibt zählt.
 */
describe("convertDocxToPdf", () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    it("schickt die DOCX an Gotenberg und liefert die zurückgegebenen PDF-Bytes", async () => {
        const fetchMock = vi.fn(async (_url: string | URL, init?: RequestInit) => {
            // Die DOCX muss als multipart/form-data unter dem Feld "files" ankommen —
            // das ist, was Gotenbergs LibreOffice-Route erwartet.
            const form = init?.body as FormData;
            const file = form.get("files") as File;
            expect(await file.text()).toBe("docx-bytes");
            expect(file.name.endsWith(".docx")).toBe(true);

            return new Response(Buffer.from("%PDF-fake"), { status: 200 });
        });
        vi.stubGlobal("fetch", fetchMock);

        const result = await convertDocxToPdf(Buffer.from("docx-bytes"));

        expect(result.toString()).toBe("%PDF-fake");
        expect(fetchMock).toHaveBeenCalledTimes(1);
        const [calledUrl, calledInit] = fetchMock.mock.calls[0];
        expect(String(calledUrl)).toContain("/forms/libreoffice/convert");
        expect(calledInit?.method).toBe("POST");
    });

    it("scheitert bei einer nicht-2xx-Antwort von Gotenberg", async () => {
        vi.stubGlobal("fetch", vi.fn(async () =>
            new Response("document could not be converted", { status: 422 })));

        await expect(convertDocxToPdf(Buffer.from("x"))).rejects.toThrow();
    });

    it("bricht die Anfrage nach 60 Sekunden ab, statt unbegrenzt zu warten", async () => {
        // `AbortSignal.timeout`s interner Zeitgeber lässt sich nicht über
        // Vitests Fake-Timer vorspulen (Node setzt ihn intern, nicht über den
        // global gepatchten `setTimeout`) — deshalb wird hier geprüft, dass
        // genau dieser Mechanismus mit 60s verdrahtet ist, und separat, dass
        // ein Abbruch des Signals die Anfrage tatsächlich scheitern lässt.
        const timeoutController = new AbortController();
        vi.spyOn(AbortSignal, "timeout").mockReturnValue(timeoutController.signal);
        vi.stubGlobal("fetch", vi.fn((_url: string | URL, init?: RequestInit) =>
            new Promise((_resolve, reject) => {
                init?.signal?.addEventListener("abort", () => {
                    reject(new DOMException("The operation was aborted.", "AbortError"));
                });
            })));

        const pending = convertDocxToPdf(Buffer.from("x"));
        timeoutController.abort();

        await expect(pending).rejects.toThrow();
        expect(AbortSignal.timeout).toHaveBeenCalledWith(60_000);
    });
});
