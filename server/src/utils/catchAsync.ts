import { NextFunction, Request, Response } from "express";

const catchAsync = (fn: any) => (request: Request, response: Response, next: NextFunction) =>
    Promise.resolve(fn(request, response, next)).catch(next);

export default catchAsync;