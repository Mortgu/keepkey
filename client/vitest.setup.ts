import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// @testing-library/react only auto-registers its afterEach(cleanup) when
// vitest's globals are enabled; this repo imports describe/it/afterEach
// explicitly instead, so cleanup is wired up here.
afterEach(cleanup);
