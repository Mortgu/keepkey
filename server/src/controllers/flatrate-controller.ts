import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getFlatRates = async (request: Request, response: Response) => {
  const flatrates = await prisma.flatRates.findMany({
    orderBy: { name: "asc" },
  });
  return response.status(200).json(flatrates);
};

export const getFlatRate = async (request: Request, response: Response) => {
  const id = request.params.id as string;

  const flatrate = await prisma.flatRates.findUnique({
    where: { id },
  });

  if (!flatrate) {
    return response
      .status(404)
      .json({ success: false, message: "Flat rate not found." });
  }

  return response.status(200).json(flatrate);
};

export const createFlatRate = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const { body } = request;

    const flatrate = await prisma.flatRates.create({
      data: { ...body },
    });

    return response.status(201).json(flatrate);
  } catch (error) {
    next(error);
  }
};

export const updateFlatRate = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const id = request.params.id as string;
    const { body } = request;

    const flatrate = await prisma.flatRates.update({
      where: { id },
      data: { ...body },
    });

    return response.status(200).json(flatrate);
  } catch (error) {
    next(error);
  }
};

export const deleteFlatRate = async (
  request: Request,
  response: Response,
  next: NextFunction,
) => {
  try {
    const id = request.params.id as string;

    await prisma.flatRates.delete({
      where: { id },
    });

    return response.status(200).json({ success: true });
  } catch (error) {
    next(error);
  }
};
