import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Spinner } from "./spinner";

describe("Spinner", () => {
    it("announces itself as a status with the given label", () => {
        render(<Spinner label="Angebote werden geladen" />);

        expect(screen.getByRole("status", { name: "Angebote werden geladen" })).toBeInstanceOf(HTMLElement);
    });

    it("stays silent for screen readers when the label is switched off", () => {
        render(<Spinner label={false} />);

        expect(screen.queryByRole("status")).toBeNull();
    });
});
