/**
 * Öffentliche Schnittstelle der Angebote. Jede Datei in diesem Ordner bildet
 * einen Use Case ab; geteilt werden nur Preisfindung (`offer-pricing`) und
 * wiederkehrende Schreibschritte (`offer-write`).
 */
export { getOffers, getOfferById, getNextQuoteId } from "./services/get-offer.service.js";
export { updateOffer } from "./services/update-offer.service.js";
export { getExtensionPrice, extendOffer } from "./extend-offer.js";
export { enqueueGeneration } from "./offer-documents.js";
