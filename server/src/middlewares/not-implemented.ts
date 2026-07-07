import type { RequestHandler } from "express";

export const notImplemented: RequestHandler = (_request, response) => {
  return response.status(501).json({
    success: false,
    message: "Not implemented",
  });
};
