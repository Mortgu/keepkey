import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Textarea } from "./textarea";

describe("Textarea", () => {
    it("links the label to the control when no id is passed", () => {
        render(<Textarea label="Notiz" />);

        expect(screen.getByLabelText("Notiz")).toBeInstanceOf(HTMLTextAreaElement);
    });

    it("keeps an explicit id instead of overriding it with the generated fallback", () => {
        render(<Textarea label="Notiz" id="note-field" />);

        const control = screen.getByLabelText("Notiz");
        expect(control.id).toBe("note-field");
    });
});
