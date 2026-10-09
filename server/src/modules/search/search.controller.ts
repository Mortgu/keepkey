import { Request, Response } from "express";
import { search } from "./search.service.js";
import { searchQuerySchema } from "@keepit/schemas";

export const getSearch = async (request: Request, response: Response) => {
    const query = searchQuerySchema.parse(request.query);
    const result = await search(query.q ?? "", query.type);
    return response.status(200).json(result);
};
