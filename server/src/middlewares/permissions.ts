import type { Request, Response, NextFunction } from "express";
import { auth } from "../lib/auth.js";

/**
 * Options for the permission middleware.
 * @property resource - The name of the resource to check permissions for (e.g. "orders").
 * @property action - The action(s) required on the resource (e.g. "view" or ["view", "update"]).
 * @property statusCode - Optional HTTP status code to return on permission failure. Defaults to 403.
 * @property errorMessage - Optional error message to return on permission failure. Defaults to a generic message.
 */
export interface PermissionOptions {
  resource: string;
  action: string | string[];
  statusCode?: number;
  errorMessage?: string;
}

/**
 * Factory that creates an Express middleware to check a user's permissions
 * via the remote auth service.
 *
 * @param options Configuration for the permission check.
 * @returns An async middleware function.
 */
export function requirePermission(options: PermissionOptions) {
  const {
    resource,
    action,
    statusCode = 403,
    errorMessage = `You do not have permission to ${Array.isArray(action) ? action.join(", ") : action} ${resource}.`,
  } = options;

  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    // If the user is not attached to the request, return an unauthorized error.
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Missing authenticated user.",
      });
    }

    // Build the body for the auth API call.
    const body = {
      userId: user.id,
      permissions: {
        [resource]: Array.isArray(action) ? action : [action],
      },
    };

    try {
      const { success } = await auth.api.userHasPermission({ body });

      if (!success) {
        return res.status(statusCode).json({
          success: false,
          message: errorMessage,
        });
      }

      next();
    } catch (err) {
      // If the auth service throws an error, forward it to the error handler.
      next(err);
    }
  };
}