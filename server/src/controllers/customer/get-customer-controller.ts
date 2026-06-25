import { Request, Response } from "express";
import { prisma } from "../../lib/prismaClient.js";
import logger from "../../middlewares/logger.js";

export const getCustomers = async (request: Request, response: Response) => {
  const customers = await prisma.customer.findMany({
    include: {
      contactPersons: true,
      orders: true,
      offers: true,
    },
  });
  return response.status(200).json(customers);
};


export const getCustomer = async (request: Request, response: Response) => {
  const id = request.params.id as string;

  const customer = await prisma.customer.findUnique({
    where: { id },
    include: {
      contactPersons: true,
      orders: true,
      offers: true,
    },
  });

  if (!customer) {
    return response.status(404).json({ success: false, message: "Customer not found!" });
  }

  return response.status(200).json(customer);
};

export const getCustomerContacts = async (request: Request, response: Response) => {
  const id = request.params.id as string;

  try {
    const contacts = await prisma.contactPerson.findMany({
      where: { customerId: id },
    });

    return response.status(200).json(contacts);
  } catch (exception: any) {
    logger.error(exception);
    return response.status(200).json([]);
  }
}

export const getAllCustomerContacts = async (request: Request, response: Response) => {
  const { id } = request.params;

  const customer = await prisma.customer.findUnique({
    where: { id: id as string },
    include: {
      contactPersons: true
    }
  });

  if (!customer) {
    return response.status(404).json({
      message: 'Customer not found!'
    });
  }

  return response.status(200).json(customer.contactPersons);
}
