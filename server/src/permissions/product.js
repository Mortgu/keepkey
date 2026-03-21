import {auth} from "../lib/auth.js";

export async function canCreateProduct(request, response, next) {
    const user = request.user;

    const { success } = await auth.api.userHasPermission({
        body: {
            userId: user.id,
            permissions: {
                product: ["create"]
            }
        },
    });

    if (!success) {
        return response.status(400).send({
            error: "Permission not found",
        })
    }

    next();
}