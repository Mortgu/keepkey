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

/**
 * Prüft den Query-String.
 *
 * Anders als {@link validate} wird das Ergebnis **nicht** zurückgeschrieben:
 * `request.query` ist in Express 5 ein Getter, eine Zuweisung würde werfen. Die
 * Controller lesen weiterhin selbst aus `request.query` — nach dieser Prüfung
 * aber mit der Gewissheit, dass die Werte konvertierbar sind.
 */
export const validateQuery = (schema: ZodSchema) => (request: Request, response: Response, next: NextFunction) => {
  const result = schema.safeParse(request.query);

  if (!result.success) {
    return response.status(400).json({
      success: false,
      message: result.error.issues.map(i => i.message).join(' & '),
    });
  }

  next();
};

export const validateParams = (schema: ZodSchema) => (request: Request, response: Response, next: NextFunction) => {
  const result = schema.safeParse(request.params);

  if (!result.success) {
    return response.status(400).json({
      success: false,
      message: result.error.issues.map(i => i.message).join(' & '),
    });
  }

  request.params = result.data as typeof request.params;
  next();
};
