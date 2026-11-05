import type {Request, Response} from "express";
import {AppException} from "../lib/exceptions.js";
import {userListSchema, userSchema} from "@keepit/schemas";

import * as service from "../services/user.service.js";

/* ========== GET ========== */

export const getUsers = async (request: Request, response: Response) => {
    const users = await service.getAllUsers(request.query);
    return response.status(200).json(userListSchema.parse(users));
};

export const getUserById = async (request: Request, response: Response) => {
    const user = await service.getUserById(request.params.id as string);
    return response.status(200).json(userSchema.parse(user));
};

export const getSessionUser = async (request: Request, response: Response) => {
    const user = await service.getSessionUser(request.user!.id);
    return response.status(200).json(user);
};

/* ========== POST ========== */

export const createUser = async (request: Request, response: Response) => {
    const user = await service.createUser(request.body);
    return response.status(200).json(user);
};

export const createContactPersons = async (request: Request, response: Response) => {
    const userId = request.user?.id;

    if (!userId) {
        throw new AppException("Unauthorized", 401, "UNAUTHORIZED");
    }

    const result = await service.createContactPersons(userId, request.body);
    return response.status(201).json(result);
};

/* ========== UPDATE ========== */

export const updateUserById = async (request: Request, response: Response) => {
    const user = await service.updateUser(
        request.params.id as string,
        request.body,
    );
    return response.status(200).json(user);
};

/* ========== DELETE ========== */

export const deleteUser = async (request: Request, response: Response) => {
    if (request.user?.id === request.params.id as string) {
        throw new AppException("You cannot delete your own account!", 403, "USER_DELETE_SELF_FORBIDDEN");
    }

    await service.deleteUser(request.params.id as string);

    return response.status(200).json({
        success: true,
        message: "Successfully deleted user!",
    });
};

export const deleteAccount = async (request: Request, response: Response) => {
    await service.deleteAccount(request.user!.id);

    return response.status(200).json({
        success: true,
        message: "Successfully deleted account!",
    });
};
