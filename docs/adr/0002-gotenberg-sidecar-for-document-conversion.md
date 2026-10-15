---
status: proposed
---

# Document conversion moves from local LibreOffice to a Gotenberg sidecar

Document generation currently calls `libreoffice-convert`, which shells out to a local `soffice` binary baked into the app image (`Dockerfile`'s `libreoffice`, `libreoffice-writer`, `default-jre`, `ghostscript`) — a path with no request timeout, missing fonts due to `--no-install-recommends`, and no defense against the `soffice` wrapper leaving an orphaned `soffice.bin` behind. We're replacing it with a call to a Gotenberg sidecar (`gotenberg/gotenberg:8.x.y`, pinned to an exact version, not the floating `:8` tag) over HTTP: `docx-to-pdf.ts` keeps its existing signature and calls out instead of spawning a process, with a 60-second request timeout. Gotenberg runs as its own Railway service with no public domain, reachable only on the private network; `libreoffice`, `libreoffice-writer`, `default-jre`, and `ghostscript` drop out of the app `Dockerfile` entirely, and `dev/docker-compose.yml` gets a matching `gotenberg` service so dev and prod share one conversion path instead of two.

## Considered Options

- Fix fonts and add a timeout to the existing local `soffice` call directly — rejected: Gotenberg already owns font bundling, timeout handling, and crash recovery as its maintained job, which is cheaper than re-solving each of those individually inside this repo.

## Consequences

- Every `app` replica had its own local LibreOffice, so conversion capacity scaled with replica count automatically. One Gotenberg instance is now shared by all of them — a new single point of contention. Starting with one instance and scaling it only if there's evidence of contention, since this is proactive work and nothing is currently broken.
- BullMQ's existing `attempts: 3` retry now actually matters: a Gotenberg timeout or crash is the first failure mode in this path that can ever throw, where previously nothing did.
- Explicitly out of scope: template-tag validation at upload time, and BullMQ's blindness to a hung (not failing) conversion. Both predate this change and aren't touched by it.
