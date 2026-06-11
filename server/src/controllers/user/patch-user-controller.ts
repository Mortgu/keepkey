import {Request, Response} from "express";
import {prisma} from "../../lib/prismaClient.js";

export const updateUserById = async (request: Request, response: Response) => {
    const {body, params} = request;
    const {id} = params;

    if (!body || !id) {
        return response.status(404).json({
            success: false,
            message: "Missing data!",
        });
    }

    try {
        const {
            name,
            salutation,
            firstName,
            lastName,
            phone,
            email,
            role,
            banned,
            banReason,
            banExpires,
            image,
        } = body;

        await prisma.user.update({
            where: {id: id as string},
            data: {
                name,
                salutation,
                firstName,
                lastName,
                phone,
                email,
                role,
                banned,
                banReason,
                banExpires,
                image,
            },
        });

        return response.status(200).json({
            success: true,
            message: "Successfully updated settings!",
        });
    } catch (exception: any) {
        return response.status(500).json({
            success: false,
            message: `Something went wrong trying to update user! ${exception.message}`,
        });
    }
};