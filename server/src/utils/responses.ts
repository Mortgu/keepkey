import type { Response } from "express";

export function successResponse<T>(
  response: Response,
  data: T,
  message: string,
): Response {
  return response.status(200).json({ success: true, message, data });
}

export function errorResponse(
  response: Response,
  status: number,
  error: string,
): Response {
  return response.status(status).json({ success: false, error });
}
