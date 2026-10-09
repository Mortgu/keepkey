/**
 * Öffentliche Schnittstelle der Angebote. Jede Datei in diesem Ordner bildet
 * einen Use Case ab; geteilt werden nur Preisfindung (`offer-pricing`) und
 * wiederkehrende Schreibschritte (`offer-write`).
 */
export { createOffer, renewOffer } from "./create-offer.js";
export { deleteOffer } from "./delete-offer.js";
export { extendOffer, getExtensionPrice } from "./extend-offer.js";
export { enqueueGeneration } from "./offer-documents.js";
export { getNextQuoteId, getOfferById, getOffers } from "./offer-queries.js";
export { updateOffer } from "./update-offer.js";

