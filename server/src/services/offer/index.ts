/**
 * Öffentliche Schnittstelle der Angebote. Jede Datei in diesem Ordner bildet
 * einen Use Case ab; geteilt werden nur Preisfindung (`offer-pricing`) und
 * wiederkehrende Schreibschritte (`offer-write`).
 */
export { getOffers, getOfferById, getNextQuoteId } from "./offer-queries.js";
export { createOffer, renewOffer } from "./create-offer.js";
export { updateOffer } from "./update-offer.js";
export { getExtensionPrice, extendOffer } from "./extend-offer.js";
export { enqueueGeneration } from "./offer-documents.js";
export { deleteOffer } from "./delete-offer.js";
