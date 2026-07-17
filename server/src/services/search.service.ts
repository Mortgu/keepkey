import { prisma } from "../lib/prismaClient.js";
import { formatCentsToEur } from "../utils/utils.js";

export type SearchType = "offer" | "order" | "customer";

export type SearchResultItem = {
    id: string;
    type: SearchType;
    title: string;
    /** Raw value to pass as the list filter's search param (e.g. quoteId, orderId, companyName). */
    searchValue: string;
    meta: string;
    updatedAt: string;
};

export type SearchResponse = {
    items: Array<SearchResultItem>;
    counts: {
        all: number;
        offer: number;
        order: number;
        customer: number;
    };
};

const LIMIT_PER_TYPE = 10;

export async function search(term: string, type?: SearchType): Promise<SearchResponse> {
    const q = term.trim();
    if (q.length === 0) {
        return { items: [], counts: { all: 0, offer: 0, order: 0, customer: 0 } };
    }

    const runOffer = type ? type === "offer" : true;
    const runOrder = type ? type === "order" : true;
    const runCustomer = type ? type === "customer" : true;

    const [offers, orders, customers] = await Promise.all([
        runOffer ? searchOffers(q) : Promise.resolve([]),
        runOrder ? searchOrders(q) : Promise.resolve([]),
        runCustomer ? searchCustomers(q) : Promise.resolve([]),
    ]);

    const counts = {
        offer: offers.length,
        order: orders.length,
        customer: customers.length,
        all: offers.length + orders.length + customers.length,
    };

    const items = [...offers, ...orders, ...customers].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );

    return { items, counts };
}

async function searchOffers(q: string): Promise<Array<SearchResultItem>> {
    const offers = await prisma.offer.findMany({
        where: { quoteId: { contains: q, mode: "insensitive" } },
        include: { customer: { select: { companyName: true } } },
        orderBy: { updatedAt: "desc" },
        take: LIMIT_PER_TYPE,
    });

    return offers.map((offer) => ({
        id: offer.id,
        type: "offer" as const,
        title: `Angebot #${offer.quoteId}`,
        searchValue: offer.quoteId,
        meta: `${offer.customer.companyName} · ${formatCentsToEur(offer.net_amount)}`,
        updatedAt: offer.updatedAt.toISOString(),
    }));
}

async function searchOrders(q: string): Promise<Array<SearchResultItem>> {
    const orders = await prisma.order.findMany({
        where: { orderId: { contains: q, mode: "insensitive" } },
        include: {
            customer: { select: { companyName: true } },
            orderPositions: { select: { id: true } },
        },
        orderBy: { updatedAt: "desc" },
        take: LIMIT_PER_TYPE,
    });

    return orders.map((order) => ({
        id: order.id,
        type: "order" as const,
        title: `Bestellung #${order.orderId}`,
        searchValue: order.orderId,
        meta: `${order.customer.companyName} · ${order.orderPositions.length} Positionen`,
        updatedAt: order.updatedAt.toISOString(),
    }));
}

async function searchCustomers(q: string): Promise<Array<SearchResultItem>> {
    const customers = await prisma.customer.findMany({
        where: {
            OR: [
                { companyName: { contains: q, mode: "insensitive" } },
                { city: { contains: q, mode: "insensitive" } },
            ],
        },
        orderBy: { updatedAt: "desc" },
        take: LIMIT_PER_TYPE,
    });

    return customers.map((customer) => {
        const year = new Date(customer.createdAt).getFullYear();
        const metaParts = [`Kunde seit ${year}`];
        if (customer.city) metaParts.push(customer.city);
        return {
            id: customer.id,
            type: "customer" as const,
            title: customer.companyName,
            searchValue: customer.companyName,
            meta: metaParts.join(" · "),
            updatedAt: customer.updatedAt.toISOString(),
        };
    });
}
