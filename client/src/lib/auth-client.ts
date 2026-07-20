import { createAuthClient } from "better-auth/react";
import { inferAdditionalFields } from "better-auth/client/plugins";
import { passkeyClient } from "@better-auth/passkey/client";
import { BASE_URL } from "./api-client.ts";


export const authClient = createAuthClient({
  baseURL: BASE_URL,
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
    passkeyClient(),
  ],
});
