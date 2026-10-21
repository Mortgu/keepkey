import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import StatCard from "./stat-card";
import i18n from "@/i18n";

describe("StatCard", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("beschriftet Anzahl und Volumen in der aktiven Sprache", async () => {
        await act(() => i18n.changeLanguage("de"));
        render(<StatCard title="Angebote" total={3} volume={100} />);

        expect(screen.getByText("Insgesamt:")).toBeTruthy();
        expect(screen.getByText("Volumen:")).toBeTruthy();

        await act(() => i18n.changeLanguage("en"));

        expect(screen.getByText("Total:")).toBeTruthy();
        expect(screen.getByText("Volume:")).toBeTruthy();
    });
});
