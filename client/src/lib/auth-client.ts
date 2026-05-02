import { createAuthClient } from "better-auth/react";
import { adminClient, inferAdditionalFields } from "better-auth/client/plugins";

import { ac, admin, employee } from "./permissions.ts";

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: "http://localhost:3000",
  plugins: [
    inferAdditionalFields({
      user: {
        salutation: {
          type: "string",
          required: true,
        },
        firstName: {
          type: "string",
          required: true,
        },
        lastName: {
          type: "string",
          required: true,
        },
        phone: {
          type: "string",
          required: false,
        },
      },
    }),
    adminClient({
      ac,
      roles: {
        admin,
        user: employee,
      },
    }),
  ],
});
