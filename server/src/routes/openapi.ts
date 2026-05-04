/*
 * - Generates the OpenAPI specification from Zod schemas
 * - Exposes it at `/api/openapi.json`
 * - Provides Swagger UI documentation at `/api/docs
 */

import { Router } from "express";
import swaggerUi from "swagger-ui-express";
import { generateOpenAPISpec } from "../lib/openapi.js";

const router = Router();

// Generate the OpenAPI spec
const openAPISpec = generateOpenAPISpec();

// Serve OpenAPI JSON
router.get("/openapi.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send(JSON.stringify(openAPISpec, null, 2));
});

// Serve Swagger UI
router.use("/docs", swaggerUi.serve);
router.get(
  "/docs",
  swaggerUi.setup(openAPISpec, {
    customCss: ".swagger-ui .topbar { display: none }",
  }),
);

export default router;
