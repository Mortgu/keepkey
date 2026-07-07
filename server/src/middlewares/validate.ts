import type { Request, Response, NextFunction } from "express";
import type { ZodSchema } from "zod";

export const validate = (schema: ZodSchema) => (request: Request, response: Response, next: NextFunction) => {
  const result = schema.safeParse(request.body);

  if (!result.success) {
    return response.status(400).json({
      success: false,
      message: result.error.issues.map(i => i.message).join(' & '),
    });
  }

  request.body = result.data;
  next();
};
