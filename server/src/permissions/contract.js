import {auth} from "../lib/auth.js";

export async function canCreateContract(request, response, next) {
    const user = request.user;

    const {success} = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permission: {
                contract: ["create"]
            },
        }
    });

    if (!success) {
        return response.status(400).json({
            success: false, message: "Can't create contract."
        });
    }

    next();
}

export async function canDeleteContract(request, response, next) {
    const user = request.user;

    const { success } = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permission: {
                contract: ["delete"]
            },
        }
    });

    if (!success) {
        return response.status(400).json({
            success: false, message: "Can't delete contract."
        });
    }

    next();
}