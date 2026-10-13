import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Input } from "./input";

describe("Input", () => {
    it("links the label to the control when no id is passed", () => {
        render(<Input label="Angebotsnummer" />);

        expect(screen.getByLabelText("Angebotsnummer")).toBeInstanceOf(HTMLInputElement);
    });

    it("keeps an explicit id instead of overriding it with the generated fallback", () => {
        render(<Input label="Angebotsnummer" id="offer-number" />);

        const control = screen.getByLabelText("Angebotsnummer");
        expect(control.id).toBe("offer-number");
    });
});
