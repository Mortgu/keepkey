/* Temporaeres Verifikationsskript — wird nach dem Lauf wieder geloescht. */
import { prisma } from "./src/lib/prismaClient.js";
import { getNextQuoteId, checkQuoteIdAvailability } from "./src/services/quote-id.service.js";
import { createOffer, updateOffer } from "./src/services/offer.service.js";

const log = (label: string, value: unknown) =>
    console.log(`\n▶ ${label}\n `, JSON.stringify(value, null, 2));

async function main() {
    const customer = await prisma.customer.findFirstOrThrow({ include: { contactPersons: true } });
    const user = await prisma.user.findFirstOrThrow();

    // Bepreisbare Kombination aus dem Tarifbaum ableiten, statt sie zu raten.
    const tariff = await prisma.tariff.findFirstOrThrow({
        where: { columns: { some: {} }, rows: { some: {} }, cells: { some: {} } },
        include: {
            columns: true,
            rows: true,
            tariffGroup: { include: { products: true } },
        },
    });
    const contract = { id: tariff.contractId };
    const product = { id: tariff.tariffGroup.products[0]!.productId };
    const duration = tariff.columns[0]!.duration;
    const quantity = tariff.rows[0]!.min_quantity;
    console.log("Kombination:", { product: product.id, contract: contract.id, duration, quantity });

    const baseInput = {
        customerId: customer.id,
        contactPersonId: customer.contactPersons[0]!.id,
        userId: user.id,
        supplierId: null,
        paymentTerm: "30 Tage",
        language: "DE" as const,
        validUntil: null,
        requestFrom: null,
        featureComparison: false,
        toCompare: [],
        offerPositions: [{
            productId: product.id,
            contractId: contract.id,
            duration_months: duration,
            free_months: 0,
            quantity,
            optional: false,
            total_cents: 1000,
            eur_user_month: 1000,
            discount_cents: 0,
        }],
        flatrates: [],
        discounts: [],
    };

    /* 1. Leerer Nummernkreis */
    log("1) getNextQuoteId auf leerem Bestand", await getNextQuoteId());

    /* 2. Angebot anlegen, Nummer rueckt vor */
    const first = await getNextQuoteId();
    const offer = await createOffer({ ...baseInput, quoteId: first.quoteId }, { actorId: user.id });
    log("2) angelegt mit", offer.quoteId);
    log("   naechste Nummer danach", await getNextQuoteId());

    /* 3. Verfuegbarkeitspruefung */
    log("3a) belegte Nummer", await checkQuoteIdAvailability(first.quoteId));
    log("3b) freie Nummer", await checkQuoteIdAvailability("26999"));
    log("3c) falsches Format", await checkQuoteIdAvailability("abc"));

    /* 4. Doppelvergabe wird abgelehnt */
    try {
        await createOffer({ ...baseInput, quoteId: first.quoteId }, { actorId: user.id });
        console.log("\n✗ 4) FEHLER: Doppelte Nummer wurde akzeptiert!");
    } catch (exception: any) {
        log("4) Doppelvergabe abgelehnt", { code: exception.code, status: exception.statusCode, message: exception.message });
    }

    /* 5. Nummer ohne Dokument ist noch aenderbar */
    const updateInput = { ...baseInput, expectedVersion: offer.version };
    const renamed = await updateOffer(offer.id, { ...updateInput, quoteId: "26500" }, user.id);
    log("5) ohne Dokument geaendert auf", renamed.quoteId);

    /* 6. Mit Dokument ist sie gesperrt */
    const task = await prisma.task.create({
        data: { type: "GENERATION", target: "OFFER", status: "PENDING" },
    });
    await prisma.offerDocument.create({
        data: { offerId: offer.id, status: "GENERATED", version: 0, taskId: task.id },
    });

    try {
        await updateOffer(offer.id, { ...updateInput, expectedVersion: renamed.version, quoteId: "26501" }, user.id);
        console.log("\n✗ 6) FEHLER: Nummer trotz Dokument geaendert!");
    } catch (exception: any) {
        log("6) mit Dokument gesperrt", { code: exception.code, status: exception.statusCode, message: exception.message });
    }

    /* 7. Andere Felder bleiben aenderbar */
    const untouched = await updateOffer(
        offer.id,
        { ...updateInput, expectedVersion: renamed.version, quoteId: renamed.quoteId, paymentTerm: "14 Tage" },
        user.id,
    );
    log("7) anderes Feld geaendert", { quoteId: untouched.quoteId, paymentTerm: untouched.paymentTerm });

    /* Aufraeumen */
    await prisma.offerDocument.deleteMany({ where: { offerId: offer.id } });
    await prisma.task.deleteMany({ where: { id: task.id } });
    await prisma.offer.delete({ where: { id: offer.id } });
    console.log("\n✔ aufgeraeumt");

    await prisma.$disconnect();
}

main().catch(async (error) => {
    console.error("Skript abgebrochen:", error);
    await prisma.$disconnect();
    process.exit(1);
});
