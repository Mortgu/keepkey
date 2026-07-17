import { Request, Response } from "express";
import { search, type SearchType } from "../services/search.service.js";

export const getSearch = async (request: Request, response: Response) => {
    const q = (request.query.q as string | undefined)?.trim() ?? "";
    const typeParam = request.query.type as string | undefined;

    let type: SearchType | undefined;
    if (typeParam && ["offer", "order", "customer"].includes(typeParam)) {
        type = typeParam as SearchType;
    }

    const result = await search(q, type);
    return response.status(200).json(result);
};
