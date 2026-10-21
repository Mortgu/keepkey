import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import IntegrationCard from "./integration-card";
import i18n from "@/i18n";

describe("IntegrationCard", () => {
    afterEach(async () => {
        await i18n.changeLanguage("de");
    });

    it("beschriftet bekannte Meta-Angaben in der aktiven Sprache", async () => {
        await act(() => i18n.changeLanguage("de"));
        render(
            <IntegrationCard
                name="S3"
                status="connected"
                meta={[
                    { label: "url", value: "https://cloud.example" },
                    { label: "endpoint", value: "https://s3.example" },
                ]}
            />,
        );

        expect(screen.getByText("Adresse:")).toBeTruthy();
        expect(screen.getByText("Endpunkt:")).toBeTruthy();

        await act(() => i18n.changeLanguage("en"));

        expect(screen.getByText("Address:")).toBeTruthy();
        expect(screen.getByText("Endpoint:")).toBeTruthy();
    });

    it("zeigt unbekannte Meta-Angaben unverändert", () => {
        render(
            <IntegrationCard
                name="Redis"
                status="connected"
                meta={[{ label: "region", value: "eu" }]}
            />,
        );

        expect(screen.getByText("region:")).toBeTruthy();
    });
});
