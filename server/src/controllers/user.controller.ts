import { Request, Response } from "express";
import { AppException } from "../lib/exceptions.js";

import * as userService from "../services/user.service.js";
import { userListSchema, userSchema } from "@keepit/schemas";

/* ========== GET ========== */

export const getAllUsers = async (request: Request, response: Response) => {
    const users = await userService.getAllUsers();
    return response.status(200).json(userListSchema.parse(users));
};

export const getUserById = async (request: Request, response: Response) => {
    const user = await userService.getUserById(request.params.id as string);
    return response.status(200).json(userSchema.parse(user));
};

export const getSessionUser = async (request: Request, response: Response) => {
    const user = await userService.getSessionUser(request.user!.id);
    return response.status(200).json(user);
};

/* ========== POST ========== */

export const createUser = async (request: Request, response: Response) => {
    const user = await userService.createUser(request.body);
    return response.status(200).json(user);
};

export const createContactPersons = async (request: Request, response: Response) => {
    const userId = request.user?.id;

    if (!userId) {
        throw new AppException("Unauthorized", 401, "UNAUTHORIZED");
    }

    const result = await userService.createContactPersons(userId, request.body);
    return response.status(201).json(result);
};

/* ========== UPDATE ========== */

export const updateUserById = async (request: Request, response: Response) => {
    const user = await userService.updateUser(
        request.params.id as string,
        request.body,
    );
    return response.status(200).json(user);
};

/* ========== DELETE ========== */

export const deleteUser = async (request: Request, response: Response) => {
    await userService.deleteUser(request.params.id as string);

    return response.status(200).json({
        success: true,
        message: "Successfully deleted user!",
    });
};

export const deleteAccount = async (request: Request, response: Response) => {
    await userService.deleteAccount(request.user!.id);

    return response.status(200).json({
        success: true,
        message: "Successfully deleted account!",
    });
};
