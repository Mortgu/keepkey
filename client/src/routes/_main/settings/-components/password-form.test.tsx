import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import PasswordForm from "./password-form";
import i18n from "@/i18n";

describe("PasswordForm", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("nennt die Mindestlänge in der aktiven Sprache, auch nach einem Sprachwechsel", async () => {
        await act(() => i18n.changeLanguage("de"));
        render(<PasswordForm />);

        fireEvent.change(screen.getByLabelText("Neues Passwort"), { target: { value: "kurz" } });

        expect(await screen.findByText("Mindestens 8 Zeichen")).toBeTruthy();

        await act(() => i18n.changeLanguage("en"));

        expect(screen.getByText("At least 8 characters")).toBeTruthy();
    });

    it("meldet abweichende Wiederholung als übersetzten Text statt als Schlüssel", async () => {
        await act(() => i18n.changeLanguage("en"));
        render(<PasswordForm />);

        fireEvent.change(screen.getByLabelText("New password"), { target: { value: "langes-passwort" } });
        fireEvent.change(screen.getByLabelText("Repeat new password"), { target: { value: "anderes-passwort" } });

        expect(await screen.findByText("Passwords do not match")).toBeTruthy();
    });
});
