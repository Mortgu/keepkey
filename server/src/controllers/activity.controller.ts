import type { Request, Response } from "express";
import { activityFilterSchema } from "@keepit/schemas";

import * as activityService from "../services/activity.service.js";

/* ========== GET ========== */

export const getActivities = async (request: Request, response: Response) => {
    const query = activityFilterSchema.parse(request.query);
    const result = await activityService.getActivities(query);
    return response.status(200).json(result);
};
