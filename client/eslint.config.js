import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";
import { tanstackConfig } from "@tanstack/eslint-config";
import i18next from "eslint-plugin-i18next";

export default defineConfig([
  ...tanstackConfig,
  globalIgnores(["dist", "eslint.config.js"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        project: null,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    // Sichtbare Texte gehören in locales/ — vorerst Warnung, bis der Bestand übersetzt ist.
    files: ["src/**/*.tsx"],
    ignores: ["src/routes/dev/**", "**/*.tests.tsx"],
    plugins: { i18next },
    rules: {
      "i18next/no-literal-string": ["warn", {
        mode: "jsx-only",
        // Technische Attribute (IDs, Varianten, Chart-Styling) sind kein sichtbarer Text.
        "jsx-attributes": {
          exclude: [
            "className", "value", "defaultValue", "form", "size", "variant", "side",
            "to", "type", "id", "name", "dataKey", "fill", "stroke", "strokeDasharray",
            "tick", "cursor",
            // Routenpräfixe der Navigationsgruppen.
            "paths",
          ],
        },
      }],
    },
  },
  {
    // Komponenten formatieren über useFormatters(): nur so ist die Sprache eine
    // Eingabe, und ein Sprachwechsel formatiert bereits gerenderte Ansichten neu.
    files: ["src/**/*.tsx"],
    ignores: ["**/*.tests.tsx"],
    rules: {
      "no-restricted-imports": ["error", {
        paths: [{
          name: "@/lib/format",
          importNames: ["formatDate", "formatEur", "formatNumber", "formatCurrency"],
          message: "Sprachabhängig formatieren über useFormatters() aus @/hooks.",
        }],
      }],
    },
  },
]);