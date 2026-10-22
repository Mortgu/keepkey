# Review of the outside "document generation fix" write-up

Convention note: the repo has no research folder. `docs/` holds `adr/` (decisions) and `agents/` (agent config), and `server/docs/` holds topic notes (`order-acceptance.md`). This is research, not a decision, so it lives in the new `docs/research/`.

Subject: `server/docs/keepkey – document generation fix.html` (third-party, untrusted). Its ZIP and `.patch` links on preview.askvix.com were NOT downloaded or run. Repo state checked: branch `xml_test`, HEAD `aa564e97`. No source was modified.

## Summary

| # | Reviewer claim | Verdict |
|---|---|---|
| 1 | `--no-install-recommends` drops fonts, so Arial falls back to DejaVu Sans | Partly. The install flag is real and Liberation is only a Recommends. The "all fonts are only recommends" part is wrong, and the box-bullet explanation is unlikely. |
| 2 | No timeout on soffice, so a hang blocks a worker slot forever; killing `soffice` leaves `soffice.bin` | Confirmed in substance. The "forever" and "orphan" parts rest on partly secondary sources. |
| 3 | Broken templates can be uploaded or saved and only fail at generation as "Multi error", retried 3x | Confirmed against the current code. |
| 4 | Keep DOCX, docxtemplater is DOCX-only, ODT wouldn't help | Mostly confirmed. The docs name DOCX/PPTX/XLSX and don't mention ODT. The "only" is an inference from silence. |
| 5 | Next steps: Gotenberg, split containers, tag check, repo cleanup | Partly. Split scripts exist. The cleanup list is stale for the current repo. Gotenberg timeout, restart and concurrency claims are unverified. |
| 6 | Based on `e92660cb` (PR #47), 50 server tests | Partly. The commit and PR are real, but main is now 45 commits ahead. I count 34 `it`/`test` calls at `e92660cb`, not 50. |

---

## Claim 1: fonts in Docker

### What the repo does
- The final stage is `FROM node:22-slim` (`Dockerfile:28`) and runs `apt-get install -y --no-install-recommends libreoffice libreoffice-writer default-jre ghostscript` (`Dockerfile:29-35`).
- The Dockerfile installs no font package explicitly.
- Neither the Dockerfile nor docs/ pins a Debian release. On Docker Hub, `22-slim` currently maps to bookworm and `22-trixie-slim` to trixie, so `22-slim` is bookworm today (https://hub.docker.com/_/node). That mapping moves over time, so check which release your build used.
- The Dockerfile is unchanged since before `e92660cb` (`git diff e92660cb HEAD -- Dockerfile` is empty).

### Debian metadata, bookworm (the current `22-slim`)
| Package | Depends | Recommends | Suggests |
|---|---|---|---|
| libreoffice-core | **fonts-opensymbol**, fontconfig | none that are fonts | none |
| libreoffice-common | none that are fonts | **fonts-liberation2** (or ttf-mscorefonts-installer) | none that are fonts |
| libreoffice-writer | none that are fonts | libreoffice-math only | **fonts-crosextra-caladea, fonts-crosextra-carlito**, default-jre |

Sources:
- https://packages.debian.org/bookworm/libreoffice-core
- https://packages.debian.org/bookworm/libreoffice-common
- https://packages.debian.org/bookworm/libreoffice-writer

### Debian metadata, trixie
- `libreoffice-common` Recommends `fonts-liberation (>= 1:2)` (https://packages.debian.org/trixie/libreoffice-common).
- `libreoffice-core` Depends on `fonts-opensymbol` (https://packages.debian.org/trixie/libreoffice-core).
- `libreoffice-writer` Suggests carlito and caladea (https://packages.debian.org/trixie/libreoffice-writer).
- The `libreoffice` metapackage Recommends liberation, carlito, caladea, dejavu and noto (https://packages.debian.org/trixie/libreoffice). Your Dockerfile installs `libreoffice` and `libreoffice-writer`, so with `--no-install-recommends` those font recommends are skipped.

### Verdict: Partly confirmed
- Correct: with `--no-install-recommends`, `fonts-liberation(2)`, the Arial-metric font, is NOT installed. It is only a Recommends of `libreoffice-common`. So Arial has no metric-compatible font in the image.
- Overstated: "all fonts are only recommends" is wrong. `fonts-opensymbol` is a hard Depends of `libreoffice-core`, so it is installed. Carlito and Caladea are Suggests, which `--no-install-recommends` also skips, but they are not "Recommends" as stated.
- Likely wrong: "bullets turned into boxes". OpenSymbol, the font LibreOffice uses for Symbol-style bullets, is installed. Missing-glyph boxes would need a different cause, for example a Wingdings or Symbol fallback with no covering font. I could not reproduce or confirm this (unverified).
- Replacement table: LibreOffice's `VCL.xcu` lists `liberationsans` first for `arial` (`SubstFonts`: `liberationsans;albanyamt;albany;arimo;nimbussansl;helvetica;...`), at line 1012 of https://github.com/LibreOffice/core/raw/refs/heads/master/officecfg/registry/data/org/openoffice/VCL.xcu. DejaVu is not in that list. So without Liberation, the DejaVu fallback comes from fontconfig's default sans, which is plausible but not shown in a source I could read. The fontconfig `30-metric-aliases.conf` fetch failed (unverified).
- The claim that Arial renders as DejaVu with different page breaks is plausible and consistent with the above. I did not run the image.

The fix direction is sound: install `fonts-liberation2`, `fonts-crosextra-carlito` and `fonts-crosextra-caladea` explicitly.

Package sizes, and whether `libreoffice-writer-nogui` exists in bookworm, are not verified. On the bookworm writer page it only appears under "Similar packages". Dropping `default-jre` and `ghostscript` as "unused" is plausible: I grepped `server/src` for ghostscript/java/gs/pdftoppm and found no hit. Check the libreoffice-convert flow before relying on this. It only calls `soffice`.

---

## Claim 2: no timeout, lock renewal, orphaned soffice.bin

### What the repo does
- `server/src/lib/docx-to-pdf.ts:9-16` calls `libconvert(docxBuffer, ".pdf", undefined, cb)` from `libreoffice-convert` with no options.
- In the installed package (v1.8.2, `node_modules/libreoffice-convert/index.js`), `convert()` calls `convertWithOptions(..., {}, ...)`.
- It then runs `execFile(soffice, args, execOptions, ...)` with `execOptions = {}`, so there is no `timeout` and no `killSignal`.
- The args are `-env:UserInstallation=<fresh tmp dir> --headless --convert-to pdf --outdir <tmp> <file>`.
- `/usr/bin/libreoffice` is tried before `/usr/bin/soffice`.
- The package does support `execOptions: {timeout}` through `convertWithOptions`, but the repo does not use it.
- There is no timeout anywhere else on the path: `render-document.ts:68` and `document-replacement.ts:284` call `convertDocxToPdf` directly.
- Worker config: `new Worker(..., { connection, concurrency: env.WORKER_CONCURRENCY })` (`server/src/workers/task-worker.ts:71`). The default is 2 (`server/src/lib/env.ts:52`).
- No `lockDuration`, `stalledInterval` or `UnrecoverableError` is set anywhere in `server/src`, so the BullMQ defaults apply.
- `docker.md:48-51` documents graceful shutdown so that "LibreOffice conversions can finish after SIGTERM". That shows the team knows conversions are long-running, but it is not a timeout.
- `package.json:16-18` has `start`, `start:api` and `start:worker`.

### BullMQ behaviour
- Local source, bullmq 5.80.2, `node_modules/bullmq/dist/cjs/classes/worker.js:34` sets the defaults `lockDuration: 30000, stalledInterval: 30000, maxStalledCount: 1`.
- `lock-manager.js:63-83` renews locks from a `setTimeout` timer running on the worker's event loop, every `lockRenewTime/2`. `lockRenewTime` defaults to `lockDuration/2`.
- While the processor is only awaiting a child process, the event loop is free, so the lock keeps being renewed and the job never counts as stalled.
- The BullMQ docs say that a job stalls when the worker cannot renew its lock, for example when the CPU is busy or the event loop is blocked (https://docs.bullmq.io/guide/workers/stalled-jobs).
- Therefore a hung `soffice` child, while Node stays healthy, holds a concurrency slot indefinitely. The reviewer's "BullMQ keeps renewing the lock" claim is correct in mechanism.
- Attribution caveat: the docs page I read does not mention `lockDuration` at all. The defaults above come from the installed source, not the docs.

### soffice versus soffice.bin
- LibreOffice's `soffice.sh` ends with `exec ... "$sd_prog/oosplash" "$@"`, so the wrapper process becomes `oosplash` (https://raw.githubusercontent.com/LibreOffice/core/master/desktop/scripts/soffice.sh).
- That script has no `trap` and no exit-code-81 handling.
- The splash binary (`oosplash`) starting `soffice.bin` as a separate child, and the resulting orphan when only the wrapper is killed, is described in LibreOffice bug and mailing-list reports found via search: https://bugs.freedesktop.org/show_bug.cgi?id=49432 and https://ask.libreoffice.org/t/will-lowriter-convert-to-command-kill-itself/18092. I could not read the C source of `oosplash` (the `start.c` URLs returned 404). Treat the orphan claim as supported by secondary reports only.
- Node's `execFile({timeout})` sends `killSignal` (default SIGTERM) only to the direct child (https://nodejs.org/api/child_process.html). On Linux, grandchildren are not killed.
- So a naive `timeout` would kill the `oosplash` process and could leave `soffice.bin` running. This matches the reviewer's claim. A correct fix needs a process group (`detached: true` plus `process.kill(-pid)`) or a `pkill` by profile directory, which is the reviewer's approach (`procps` for `pkill`).

### Verdict: Confirmed (mechanism). "Forever" is exactly true only while the Node process stays alive and responsive.

---

## Claim 3: broken templates accepted, "Multi error", retried 3x

### What the repo does
- Upload and editor-save go through `createTemplate` and `replaceTemplateContent` (`server/src/controllers/document-template.controller.ts:16` and `:29`).
- Both call only `assertDocxBuffer` (`server/src/services/document-template.service.ts:71` and `:106`). That function (`server/src/lib/docx.ts:21`) checks size, non-empty, and that the file is a ZIP containing `word/document.xml` via PizZip.
- Neither path instantiates docxtemplater, so unclosed or unopened tags are not detected at upload or save.
- docxtemplater is constructed only at render time, in `server/src/lib/render-document.ts:55` and `server/src/documents/document-renderer.ts:8`.
- `new Docxtemplater(zip, ...)` compiles the template in the constructor, which is also when it throws for invalid templates.
- The docs say the constructor can throw a TemplateError when the template is invalid, and most such errors come as a "MultiError" with `error.properties.errors` (https://docxtemplater.com/docs/errors/).
- Per-error properties include `id`, `explanation`, `xtag` and `file`. I could not confirm an `offset` property from that page.
- In `render-document.ts` the constructor runs on the worker path, so the error is thrown there.
- Job retry config: `taskJobOptions = { attempts: 3, backoff: exponential 2000ms }` (`server/src/workers/task-contract.ts:15-20`).
- The worker rethrows every handler error (`task-worker.ts:56-66`), and nothing in `server/src` uses `UnrecoverableError`. So a broken template is retried 3 times with backoff before the task is marked FAILED (`task-lifecycle.ts:78-140`).
- BullMQ documents `UnrecoverableError` as moving the job to failed "without performing any retries" (https://docs.bullmq.io/patterns/stop-retrying-jobs).

### Verdict: Confirmed. Compile-on-upload plus `UnrecoverableError` for template errors is a sound approach.

Detail the reviewer left out: the failed `error.message` stored on the task and documents would be the opaque "Multi error" text, because the code copies `error.message`. Surfacing `properties.errors[].properties.explanation` would give readable messages.

---

## Claim 4: DOCX versus ODT

- The docxtemplater get-started page names DOCX, PPTX and XLSX and does not mention ODT (https://docxtemplater.com/docs/get-started-node/). I could not read the whole FAQ (the page was truncated at 100000 characters), so I cannot rule out an ODT mention elsewhere.
- The FAQ says docxtemplater cannot convert to PDF itself and suggests `libreoffice --headless --convert-to pdf`, and that "the rendering is not 100% perfect since it uses libreoffice and not microsoft word" (https://docxtemplater.com/docs/faq/).
- The reviewer's reasoning (LibreOffice is the PDF step either way) is correct.
- The in-app editor needing DOCX is a repo fact I did not independently verify.

### Verdict: Mostly confirmed. "Only DOCX" is inferred from silence in the docs, not from an explicit statement.

---

## Claim 5: next steps

| Item | Finding |
|---|---|
| Gotenberg sidecar | Gotenberg's source starts LibreOffice with a per-instance profile (`-env:UserInstallation=file://<dir>`), has a configurable start timeout, and uses `cmd.Kill()` on stop (https://raw.githubusercontent.com/gotenberg/gotenberg/main/pkg/modules/libreoffice/api/libreoffice.go). Its Dockerfile installs fonts-liberation, liberation2, carlito, caladea, dejavu and noto (https://raw.githubusercontent.com/gotenberg/gotenberg/main/build/Dockerfile). **Not verified**: conversion timeouts, restart-after-N-conversions, and queue/concurrency behaviour. gotenberg.dev failed to load (TLS error), and the Go file shows no conversion timeout or restart counter. Read https://gotenberg.dev/docs before deciding. |
| Separate API/worker containers | `start:api` and `start:worker` exist (`server/package.json:17-18`). The Dockerfile `CMD` still runs the combined `node dist/server.js` (`Dockerfile:56`). Confirmed. |
| Check template tags against schema on upload | The code already has `warnOnTemplateDrift` using `InspectModule` (`render-document.ts:54-62` and `:100`), logging a warning at render time only. The reviewer's description is accurate. |
| `.~lock.order.docx#`, backup `.docx`, `invoice copy.docx` | **Stale for the current repo.** They existed at `e92660cb`: `.~lock.order.docx#`, `invoice copy.docx`, `offer_backup.docx`, `offer_backup2.docx`, `offer_backup3.docx`, `offer-new_but_wrong.docx`, `offer-template.docx`. All were removed by commit `565e78d3`. At HEAD, `git ls-files` still tracks `server/assets/templates/offer Kopie.docx` (a copy). |
| Committed `shared/dist` | At `e92660cb` it was tracked (`git ls-tree`). `545656d1` "removed dist from tracking" fixed this. At HEAD `git ls-files shared/dist` is empty and `shared/dist/` is gitignored. |

### Verdict: Partly. Container split is confirmed. The cleanup items are mostly already done on current main, with `offer Kopie.docx` as the remaining one. Gotenberg claims are unverified.

---

## Claim 6: base commit and test count

- `e92660cb` exists: "Merge pull request #47 from Mortgu/feat/sortable-tariffs" (`git log`). Confirmed.
- HEAD is 45 commits ahead of it, so the reviewer's patch targets an old base and may not apply cleanly. For example, the document pipeline was restructured since (`d361e7de` "Deepen document generation into one adapter-based module", `eb0fa519`).
- Test count: I counted `it(`/`test(` calls in tracked `server/**/*.test.ts`: 34 at `e92660cb` and 196 at HEAD across 33 test files. A grep count is an approximation (`it.each` and multi-line forms differ), and the reviewer's "50 server tests (7 new)" may count after the patch or with a different method. Not confirmed: I cannot reproduce 50 without running vitest, which I avoided.

---

## Things the reviewer missed or got wrong

1. **A per-job profile dir is already used.** `libreoffice-convert` passes `-env:UserInstallation` pointing to a fresh temp dir per call (`index.js`, `installDir`), and deletes it in `finally`. So concurrent soffice instances do not share a profile or collide on the profile lock. This is the usual cause of "soffice hangs on parallel runs" and it is not an issue here. The cost is a cold start per conversion (profile creation each time), which matters for latency but not correctness.
2. **Concurrency in the reviewer's patch.** They add `DOCX_TO_PDF_CONCURRENCY` default 1. Since each call gets its own profile, concurrency 2 (the current `WORKER_CONCURRENCY`) is functionally safe. The cap is a resource choice (RAM, CPU), not a correctness need.
3. **Timeouts also hit the API path.** `document-replacement.ts:278-284` calls `convertDocxToPdf` outside the worker, from the HTTP path. A hung soffice there blocks an HTTP request, not just a BullMQ slot.
4. **Temp-file cleanup on kill.** On a hard kill, libreoffice-convert's `finally` cleanup still runs because the exec callback fires. If the Node process itself is SIGKILLed (see `docker.md` shutdown notes), temp dirs under the OS tmp dir leak. Low impact, noted.
5. **Untrusted DOCX into LibreOffice (security).** The template path is behind your own upload endpoint (`assertDocxBuffer` limits size to 25 MB and checks ZIP structure), and the editor-save path replaces content. A malicious or malformed DOCX goes to a full LibreOffice process with network access (remote images, linked OLE or external references are fetched on load by default in some configurations). I did not test LibreOffice's behaviour on external links; treat as a risk to assess, not a finding. Mitigations a reviewer would suggest: run the conversion in an unprivileged container with no outbound network (Gotenberg sidecar with egress blocked fits this), plus the timeout and a memory limit.
6. **ZIP bomb.** `assertDocxBuffer` limits the compressed size (25 MB) but PizZip decompresses on read. Not tested; a decompressed-size check is not present in `server/src/lib/docx.ts`.
7. **Error messages.** Template errors fail as generic task errors (see Claim 3), and there is no mapping to the German UI messages for `INVALID_TEMPLATE` yet in the current repo. The reviewer adds one in their patch, which I did not read.

## What I did not verify

- The reviewer's ZIP, patch, and their "reproduced with your offer.docx" claim (explicitly not downloaded or run).
- Any Docker image build or LibreOffice rendering (no containers run).
- Gotenberg timeouts, restart policy and concurrency (docs not reachable).
- `oosplash` source (404); the orphaned `soffice.bin` behaviour rests on bug reports and the shell wrapper source only.
- fontconfig's Arial alias file (fetch failed).
- The reviewer's test count.
