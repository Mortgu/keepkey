import { describe, expect, it } from "vitest";
import { formatParty } from "./party.js";

describe("formatParty", () => {
    it("builds fullName from salutation, firstName and lastName", () => {
        const result = formatParty({ salutation: "Herr", firstName: "Max", lastName: "Mustermann", phone: "123", email: "max@tests.de" });
        expect(result.fullName).toBe("Herr Max Mustermann");
    });

    it("drops the leading space and coerces salutation to \"\" when null", () => {
        const result = formatParty({ salutation: null, firstName: "Max", lastName: "Mustermann", phone: "123", email: "max@tests.de" });
        expect(result.fullName).toBe("Max Mustermann");
        expect(result.salutation).toBe("");
    });

    it("drops the leading space and coerces salutation to \"\" when undefined", () => {
        const result = formatParty({ salutation: undefined, firstName: "Max", lastName: "Mustermann", phone: "123", email: "max@tests.de" });
        expect(result.fullName).toBe("Max Mustermann");
        expect(result.salutation).toBe("");
    });

    it("drops the leading space when salutation is an empty string", () => {
        const result = formatParty({ salutation: "", firstName: "Max", lastName: "Mustermann", phone: "123", email: "max@tests.de" });
        expect(result.fullName).toBe("Max Mustermann");
    });

    it("coerces phone to \"\" when null or undefined, passes it through otherwise", () => {
        expect(formatParty({ salutation: "Herr", firstName: "Max", lastName: "M", phone: null, email: "x@tests.de" }).phone).toBe("");
        expect(formatParty({ salutation: "Herr", firstName: "Max", lastName: "M", phone: undefined, email: "x@tests.de" }).phone).toBe("");
        expect(formatParty({ salutation: "Herr", firstName: "Max", lastName: "M", phone: "0123", email: "x@tests.de" }).phone).toBe("0123");
    });

    it("coerces email to \"\" when null or undefined, passes it through otherwise", () => {
        expect(formatParty({ salutation: "Herr", firstName: "Max", lastName: "M", phone: "0123", email: null }).email).toBe("");
        expect(formatParty({ salutation: "Herr", firstName: "Max", lastName: "M", phone: "0123", email: undefined }).email).toBe("");
        expect(formatParty({ salutation: "Herr", firstName: "Max", lastName: "M", phone: "0123", email: "x@tests.de" }).email).toBe("x@tests.de");
    });
});
