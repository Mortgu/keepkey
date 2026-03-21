import {auth} from "../lib/auth.js";
import {fromNodeHeaders} from "better-auth/node";

export async function requireSession(req, res, next) {
    try {
        const session = await auth.api.getSession({
            headers: fromNodeHeaders(req.headers),
        });

        if (!session) {
            return res.status(401).send({
                success: false, message: 'Not authorized',
            });
        }

        req.user = session.user;
        return next();
    } catch (exception) {
        return res.status(401).send({
            success: false, message: 'Not authorized',
        })
    }
}