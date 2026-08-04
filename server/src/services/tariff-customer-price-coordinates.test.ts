import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Kundenpreise hängen an (duration, min_quantity). Diese Tests halten fest, dass
 * die Koordinaten bei Strukturänderungen mitgeführt bzw. aufgeräumt werden —
 * sonst zeigt ein ausgehandelter Preis stillschweigend ins Leere oder wacht
 * später an derselben Koordinate wieder auf.
 */
const tx = vi.hoisted(() => ({
    tariffRow: {
        findUnique: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    tariffColumn: {
        findUnique: vi.fn(),
        findFirst: vi.fn(),
        findMany: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
    tariffCustomerPrice: {
        deleteMany: vi.fn(),
        updateMany: vi.fn(),
    },
}));

vi.mock("../lib/prismaClient.js", () => ({
    prisma: {
        $transaction: (callback: (client: typeof tx) => unknown) => callback(tx),
    },
}));

import {
    deleteTariffColumn,
    deleteTariffRow,
    updateTariffColumn,
    updateTariffRow,
} from "./tariff.service.js";

beforeEach(() => {
    vi.clearAllMocks();
    // reindexRows/reindexColumns laufen über dieselben findMany — leer halten.
    tx.tariffRow.findMany.mockResolvedValue([]);
    tx.tariffColumn.findMany.mockResolvedValue([]);
    tx.tariffCustomerPrice.deleteMany.mockResolvedValue({ count: 0 });
    tx.tariffCustomerPrice.updateMany.mockResolvedValue({ count: 0 });
});

describe("updateTariffRow", () => {
    it("zieht Kundenpreise auf die neue Mengenuntergrenze nach", async () => {
        const current = { id: "row-1", tariffId: "tariff-1", min_quantity: 11, max_quantity: null };
        tx.tariffRow.findUnique.mockResolvedValue(current);
        tx.tariffRow.findMany.mockResolvedValue([current]);
        tx.tariffRow.update.mockResolvedValue({ ...current, min_quantity: 10 });

        await updateTariffRow("row-1", { min_qty: 10 });

        expect(tx.tariffCustomerPrice.updateMany).toHaveBeenCalledWith({
            where: { tariffId: "tariff-1", min_quantity: 11 },
            data: { min_quantity: 10 },
        });
    });

    it("rührt die Kundenpreise nicht an, wenn nur die Obergrenze wandert", async () => {
        const current = { id: "row-1", tariffId: "tariff-1", min_quantity: 11, max_quantity: 20 };
        tx.tariffRow.findUnique.mockResolvedValue(current);
        tx.tariffRow.findMany.mockResolvedValue([current]);
        tx.tariffRow.update.mockResolvedValue({ ...current, max_quantity: 30 });

        await updateTariffRow("row-1", { max_qty: 30 });

        expect(tx.tariffCustomerPrice.updateMany).not.toHaveBeenCalled();
        expect(tx.tariffCustomerPrice.deleteMany).not.toHaveBeenCalled();
    });

    it("räumt verwaiste Preise auf der Zielkoordinate ab, bevor es verschiebt", async () => {
        const current = { id: "row-1", tariffId: "tariff-1", min_quantity: 11, max_quantity: null };
        tx.tariffRow.findUnique.mockResolvedValue(current);
        tx.tariffRow.findMany.mockResolvedValue([current]);
        tx.tariffRow.update.mockResolvedValue({ ...current, min_quantity: 10 });

        await updateTariffRow("row-1", { min_qty: 10 });

        // Ohne dieses Aufräumen bricht der Unique-Index beim Verschieben.
        expect(tx.tariffCustomerPrice.deleteMany).toHaveBeenCalledWith({
            where: { tariffId: "tariff-1", min_quantity: 10 },
        });
    });
});

describe("deleteTariffRow", () => {
    it("löscht die Kundenpreise der Mengenstaffel mit", async () => {
        tx.tariffRow.delete.mockResolvedValue({
            id: "row-1", tariffId: "tariff-1", min_quantity: 11,
        });

        await deleteTariffRow("row-1");

        expect(tx.tariffCustomerPrice.deleteMany).toHaveBeenCalledWith({
            where: { tariffId: "tariff-1", min_quantity: 11 },
        });
    });
});

describe("updateTariffColumn", () => {
    it("zieht Kundenpreise auf die neue Laufzeit nach", async () => {
        tx.tariffColumn.findUnique.mockResolvedValue({
            id: "col-1", tariffId: "tariff-1", duration: 12,
        });
        tx.tariffColumn.findFirst.mockResolvedValue(null);
        tx.tariffColumn.update.mockResolvedValue({ id: "col-1", duration: 24 });

        await updateTariffColumn("col-1", { duration: 24 });

        expect(tx.tariffCustomerPrice.updateMany).toHaveBeenCalledWith({
            where: { tariffId: "tariff-1", duration: 12 },
            data: { duration: 24 },
        });
    });

    it("verschiebt nichts, wenn die Laufzeit schon belegt ist", async () => {
        tx.tariffColumn.findUnique.mockResolvedValue({
            id: "col-1", tariffId: "tariff-1", duration: 12,
        });
        tx.tariffColumn.findFirst.mockResolvedValue({ id: "col-2", duration: 24 });

        await expect(updateTariffColumn("col-1", { duration: 24 }))
            .rejects.toMatchObject({ code: "DURATION_ALREADY_EXISTS" });

        expect(tx.tariffCustomerPrice.updateMany).not.toHaveBeenCalled();
    });
});

describe("deleteTariffColumn", () => {
    it("löscht die Kundenpreise der Laufzeit mit", async () => {
        tx.tariffColumn.delete.mockResolvedValue({
            id: "col-1", tariffId: "tariff-1", duration: 12,
        });

        await deleteTariffColumn("col-1");

        expect(tx.tariffCustomerPrice.deleteMany).toHaveBeenCalledWith({
            where: { tariffId: "tariff-1", duration: 12 },
        });
    });
});
