import type {Request, Response} from "express";
import {searchQuerySchema} from "@keepit/schemas";
import {search} from "../services/search.service.js";

export const getSearch = async (request: Request, response: Response) => {
    const query = searchQuerySchema.parse(request.query);
    const result = await search(query.q ?? "", query.type);
    return response.status(200).json(result);
};
