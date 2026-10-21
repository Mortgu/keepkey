import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FieldInput } from "./field-input";
import type { TranslationKey } from "@/i18n";
import type { BindableField } from "./field-input";
import i18n from "@/i18n";

function fieldWithError(message: string): BindableField<string> {
    return {
        name: "products",
        state: { value: "", meta: { errors: [{ message }] } },
        handleChange: () => {},
        handleBlur: () => {},
    };
}

describe("FieldInput-Fehlermeldung", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("übersetzt eine Meldung, die ein Übersetzungsschlüssel ist, in der aktiven Sprache", async () => {
        await act(() => i18n.changeLanguage("de"));
        render(<FieldInput field={fieldWithError("workloads.validation.productsRequired" satisfies TranslationKey)} />);

        expect(screen.queryByText("Mindestens 1 Produkt auswählen")).not.toBeNull();

        await act(() => i18n.changeLanguage("en"));

        expect(screen.queryByText("Select at least 1 product")).not.toBeNull();
    });

    it("setzt Parameter in die übersetzte Meldung ein", async () => {
        await act(() => i18n.changeLanguage("de"));
        render(
            <FieldInput
                field={fieldWithError("validation.passwordMin" satisfies TranslationKey)}
                errorParams={{ "validation.passwordMin": { count: 12 } }}
            />,
        );

        expect(screen.queryByText("Mindestens 12 Zeichen")).not.toBeNull();
    });

    it("zeigt eine Meldung ohne Schlüssel unverändert an", async () => {
        await act(() => i18n.changeLanguage("en"));
        render(<FieldInput field={fieldWithError("Name ist erforderlich")} />);

        expect(screen.queryByText("Name ist erforderlich")).not.toBeNull();
    });
});
