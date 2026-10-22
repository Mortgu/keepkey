import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import { isReactCompilerTarget } from "./src/lib/react-compiler-include";

export default defineConfig({
    // Wie in vite.config.ts: Komponenten laufen im Test durch den React Compiler,
    // damit veraltete gemerkte Ausgaben (z. B. nach einem Sprachwechsel) auffallen.
    plugins: [
        react(),
        babel({ presets: [reactCompilerPreset()], include: isReactCompilerTarget }),
    ],
    resolve: {
        conditions: ["development"],
        alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    test: {
        include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
        environment: "jsdom",
        setupFiles: ["./vitest.setup.ts"],
    },
});
