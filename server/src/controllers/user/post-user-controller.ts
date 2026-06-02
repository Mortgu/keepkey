import {Request, Response} from "express";
import {auth} from "../../lib/auth.js";
import {prisma} from "../../lib/prismaClient.js";

export const createUser = async (request: Request, response: Response) => {
    const {body} = request;

    if (!body) {
        return response.status(404).json({
            success: false,
            message: "Missing data!",
        });
    }

    try {
        const createdUser = await auth.api.signUpEmail({
            body: {
                email: body.email,
                password: body.password,
                name: `${body.firstName} ${body.lastName}`,
                firstName: body.firstName,
                lastName: body.lastName,
                salutation: body.salutation,
            },
        });

        return response.status(200).json(createdUser);
    } catch (exception: any) {
        return response.status(500).json({
            success: false,
            message: "Something went wrong trying to create user!",
            exception: exception.message,
        });
    }

    return response.status(200).json({
        success: true,
        message: "Successfully created user!",
    });
};


export const createContactPersons = async (request: Request, response: Response) => {
    const persons: Array<{
        salutation: string;
        firstName: string;
        lastName: string;
        email?: string;
    }> = request.body;
    const userId = request.user?.id;

    if (!userId) {
        return response
            .status(401)
            .json({success: false, message: "Unauthorized"});
    }

    try {
        const createdContactPerson = await prisma.$transaction(async (tx) => {
            const customer = await prisma.customer.findUnique({
                where: {
                    id: userId,
                },
            });

            if (!customer) {
                return response.status(400).json({
                    success: false,
                    message: "No customer linked to this account!",
                });
            }

            const created = await prisma.contactPerson.createMany({
                data: persons.map((p) => ({...p, customerId: customer.id})),
            });

            return created;
        });

        return response.status(201).json(createdContactPerson);
    } catch (error) {
        return response.status(500).json({
            success: false,
            message: "Failed to create contact persons",
        });
    }
};
