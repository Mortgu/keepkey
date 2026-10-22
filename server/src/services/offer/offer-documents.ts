import { requestGeneration } from "../document/document-generation-request.js";

export async function enqueueGeneration(offerId: string) {
    return requestGeneration("offer", offerId);
}
