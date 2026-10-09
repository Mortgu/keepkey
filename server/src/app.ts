import { toNodeHandler } from "better-auth/node";
import cors from "cors";
import express, { type Express } from "express";
import path from "path";

import { auth } from "@/core/auth.js";
import env from "@/config/env.js";
import { exceptionHandler } from "@/core/middleware/exception.middleware.js";
import morganMiddleware from "@/core/middleware/morgan.middleware.js";
import { requestIdMiddleware } from "@/core/middleware/request.middleware.js";
import router from "@/router.js";

/**
 * Baut die Express-App. Keine Initialisierung externer Dienste, kein
 * `listen()`, keine Signal-Handler — das übernehmen die Entry-Points.
 */
export function createApp(): Express {
    const app = express();

    app.set('trust proxy', true);

    app.use(requestIdMiddleware);

    app.use(morganMiddleware);

    app.use(
        cors({
            origin: env.CORS_ORIGIN,
            methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
            credentials: true,
            exposedHeaders: ["X-Request-Id"],
        }),
    );

    app.all("/api/auth/*splat", toNodeHandler(auth));

    app.use(express.json());

    app.use("/api", router);

    app.use("/api/*splat", (req, res) => res.status(404).json({ code: "NOT_FOUND", message: "Not found", requestId: req.id }));

    app.use(express.static(path.join(process.cwd(), "../client/dist")));

    app.get("{*path}", (req, res) => {
        res.sendFile(path.join(process.cwd(), "../client/dist/index.html"));
    });

    // Global error handler
    app.use(exceptionHandler);

    return app;
}
