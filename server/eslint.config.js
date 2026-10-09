import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "node_modules", "eslint.config.js", "prisma/migrations"]),
  {
    files: ["**/*.ts"],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true, caughtErrors: "none" },
      ],
      // Altlast: wird abgebaut, nicht erweitert. CI bricht bei mehr Warnungen als heute ab (siehe lint-Script).
      "@typescript-eslint/no-explicit-any": "warn",
      // Express-Typerweiterungen (Request.user etc.) brauchen `declare global`/namespace.
      "@typescript-eslint/no-namespace": "warn",
    },
  },
]);
