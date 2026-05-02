import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";

export const getPrice = async (request: Request, response: Response) => {
  const { productId, contractId, duration_months, quantity } = request.query;

  if (!productId || !contractId || !duration_months || !quantity) {
    return response
      .status(400)
      .send({
        message:
          "productId, contractId, duration_months und quantity sind erforderlich.",
        success: false,
      });
  }

  const durationNum = parseInt(duration_months as string);
  const quantityNum = parseInt(quantity as string);

  if (isNaN(durationNum) || isNaN(quantityNum) || quantityNum <= 0) {
    return response
      .status(400)
      .send({
        message:
          "duration_months und quantity müssen positive Ganzzahlen sein.",
        success: false,
      });
  }

  //const result = await calculatePrice(productId as string, contractId as string, duration_months, quantityNum);
  const result = null;

  if (!result) {
    return response
      .status(404)
      .send({
        message: "Kein passender Preiseintrag gefunden.",
        success: false,
      });
  }

  return response.status(200).json(result);
};

export const createPricing = async (request: Request, response: Response) => {
  const { product_id } = request.params;
  const { body } = request;

  if (!body || !product_id) {
    return response.status(400).json({
      message: "Bad request. Missing body or product id!",
    });
  }

  try {
    const result = await prisma.productPricing.create({
      data: { productId: product_id, ...body },
    });

    return response.status(200).json(result);
  } catch (exception: any) {
    return response.status(500).json({
      message: "Failed to create new pricing for product!",
    });
  }
};

export const deletePricing = async (request: Request, response: Response) => {
  const { id } = request.params;

  try {
    const deletedPricing = await prisma.productPricing.deleteMany({
      where: { id: id as string },
    });

    return response.status(200).json(deletedPricing);
  } catch (exception: any) {
    return response.status(500).json({
      message: "Something went wrong trying to delete product pricing!",
      error: exception.message,
    });
  }
};
