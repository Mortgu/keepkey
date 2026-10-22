# Reviewer feedback on LibreOffice/Docker/DOCX-validation — verification

Status: research only, no recommendation on whether to adopt the reviewer's
patch. This checks each factual claim in the third-party feedback (quoted in
full in the task) against primary external sources and the actual repo state.
The patch/ZIP itself was not available — only the reviewer's prose was
reviewed, so claims about the patch's own content ("50 tests, 7 new",
`UnrecoverableError`, `INVALID_TEMPLATE`, etc.) are verified only as "does the
claimed problem exist today" / "does nothing by that name exist today yet",
not "does the patch actually implement this correctly."

A note on scope mismatch: a prior research file in this repo
(`docs/research/docx-vs-odt-and-pdf-only-architecture.md`, written against
branch `xml_test` @ `8547620c`) describes a `server/src/lib/render-document.ts`
module as the central docxtemplater call site. On this worktree's branch
(based on current `main`), **no such file exists** — the docxtemplater
constructor/render calls are inlined per-pipeline instead, in
`server/src/pipelines/offer/actions.ts::generateAction` and the parallel
`server/src/pipelines/order/actions.ts`. Where the two docs disagree, this one
reflects what is actually on disk in this worktree today. Where they overlap
(pizzip `^3.2.0`, `assertDocxBuffer`'s magic-byte-only validation), they are
consistent.

## A. Fonts: `--no-install-recommends` skips font packages → DejaVu substituted for Arial

**Verdict: Confirmed.**

Repo evidence — `Dockerfile` lines 29–35:

```
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
    libreoffice \
    libreoffice-writer \
    default-jre \
    ghostscript \
    && rm -rf /var/lib/apt/lists/*
```

`--no-install-recommends` is present, and the `libreoffice` metapackage is
installed alongside `libreoffice-writer`.

Primary-source evidence (Debian package metadata, checked on both `bookworm`
— Debian 12, the current `node:22-slim` base per the official `node` Docker
image README — and `trixie` — Debian 13, in case the tag has since moved):

- `packages.debian.org/bookworm/libreoffice` (the metapackage this Dockerfile
  installs) lists, under **Recommends**: `fonts-crosextra-caladea`
  ("Serif font metric-compatible with the Cambria font"),
  `fonts-crosextra-carlito` ("Sans-serif font metric-compatible with Calibri
  font"), `fonts-dejavu`, `fonts-liberation` ("Fonts with the same metrics as
  Times, Arial and Courier"), `fonts-liberation2`, `fonts-linuxlibertine`,
  `fonts-noto-core`/`-extra`/`-mono`/`-ui-core`, `fonts-sil-gentium-basic`.
  None of these appear under **Depends**.
- `packages.debian.org/trixie/libreoffice` shows the same set under
  Recommends (`fonts-crosextra-caladea`, `fonts-crosextra-carlito`,
  `fonts-dejavu`, `fonts-liberation (>= 1:2)`, plus the Noto/Linux Libertine
  additions) — the pattern is stable across releases.
- `packages.debian.org/bookworm/libreoffice-writer` itself has only
  `libreoffice-math` as a Recommends; `fonts-crosextra-caladea` and
  `fonts-crosextra-carlito` appear there only under **Suggests** (weaker than
  Recommends, and `apt-get install` never pulls Suggests regardless of the
  `--no-install-recommends` flag). This means the font gap in this Dockerfile
  comes specifically from the `libreoffice` metapackage's Recommends being
  skipped, not from `libreoffice-writer`'s (much thinner) dependency tree —
  a nuance the reviewer's feedback doesn't distinguish but that doesn't change
  the conclusion, since `libreoffice` is also installed here.
- Since `apt-get install -y --no-install-recommends` by definition does not
  install Recommends-only packages, and the Dockerfile has no explicit
  `apt-get install fonts-liberation fonts-crosextra-carlito ...` line, the
  container will end up without Liberation/Carlito/Caladea, falling back to
  whatever default sans/serif substitution LibreOffice's font-substitution
  table picks for Arial/Times/Calibri — consistent with the reviewer's
  reported symptom (DejaVu Sans substitution, different line/page breaks,
  bullets rendering as boxes, the classic symptom of a missing symbol/bullet
  font like OpenSymbol or a Wingdings-class font).

**Liberation fonts' metric compatibility** is independently, directly
documented: Red Hat's own blog ("liberation fonts",
redhat.com/en/about/blog/liberation-fonts) describes the three Liberation
families as metrically-equivalent, GPL-licensed substitutes for Arial, Times
New Roman and Courier New, released by Red Hat specifically to solve
document-reflow problems caused by missing proprietary fonts on Linux. Debian's
own package description for `fonts-liberation` ("Fonts with the same metrics
as Times, Arial and Courier") says the same thing. This part of the reviewer's
framing is not just plausible — it is the documented reason these fonts
exist.

**Note on `fonts-opensymbol` / bullets-as-boxes specifically**: neither
`fonts-opensymbol` nor `fonts-dejavu-core` surfaced in the Debian pages
fetched for `libreoffice`/`libreoffice-writer`'s Recommends list in this
check — `fonts-dejavu` (the metapackage) did. OpenSymbol (LibreOffice's
built-in bullet/symbol font) ships as part of `libreoffice-core`'s own data in
current Debian packaging rather than as a separate Recommends in all cases;
this check did not conclusively trace which package provides the bullet glyph
LibreOffice falls back to when OpenSymbol itself is present but a document
references a font not on the system. Treat the specific "bullets became boxes"
mechanism as plausible-and-consistent-with-missing-fonts rather than
individually pinned to a single named Debian package.

## B. `soffice` wrapper vs `soffice.bin` — killing the wrapper doesn't kill the real process

**Verdict: Confirmed, and directly relevant to this codebase's actual code path.**

Repo evidence — `server/src/lib/docx-to-pdf.ts` calls
`libconvert(docxBuffer, ".pdf", undefined, callback)` from the
`libreoffice-convert` npm package (`^1.8.1` in `server/package.json`). Reading
that package's installed source
(`node_modules/libreoffice-convert/index.js`, lines 19–71) shows it resolves
the binary to run by probing a fixed list of paths on Linux — `
'/usr/bin/libreoffice', '/usr/bin/soffice', '/snap/bin/libreoffice',
'/opt/libreoffice/program/soffice', ...` — and invokes whichever exists first
via Node's `child_process.execFile`, with **no `timeout` option set**
(`convertDocxToPdf` passes `undefined` for options, so `execOptions = {}`,
and `execFile`'s default timeout is `0`, i.e. none).

Primary-source evidence that `/usr/bin/soffice` is a wrapper, not the real
process: this is long-standing, documented LibreOffice/OpenOffice behavior,
not folklore. A LibreOffice bug tracker comment (bugs.freedesktop.org #49432)
states explicitly: *"on linux one ends up with a bunch of zombie soffice.bin
processes"* when the wrapper is killed, because *"[starting] with the soffice
script in a daemon on linux isn't feasible because it doesn't give the
starting process any way to kill the real soffice.bin process."* An Apache
OpenOffice bug (bz-he-de.apache.org/ooo/show_bug.cgi?id=39390) confirms the
PID printed by the wrapper is the shell-wrapper's PID, and the real process's
PID must be found separately via `ps`. Developer guidance in that thread is
unambiguous: *"You must always start soffice, not soffice.bin"* — because
`soffice.bin` can exit with code 81 specifically so the wrapper can restart
it, i.e. the two-process relationship is intentional, not an implementation
accident.

Because `libreoffice-convert` invokes whichever of `/usr/bin/libreoffice` or
`/usr/bin/soffice` is found first (both are wrapper scripts, not
`soffice.bin` directly), and because `execFile` never sets a timeout here, a
hung conversion has no code path in this repo that would ever kill anything —
there is nothing today that calls `.kill()` on the child process at all, so
the wrapper-vs-`.bin` distinction is currently moot in practice (nothing
attempts to kill either process), but it is exactly the pitfall the reviewer
describes once a naive `timeout`+`kill(child.pid)` fix is attempted without
knowing to target `soffice.bin` specifically.

## C. BullMQ lock renewal keeps a hung job's slot alive forever

**Verdict: Confirmed, with a more precise mechanism than "CPU-intensive work blocks renewal."**

Primary-source evidence (BullMQ's own docs, `docs.bullmq.io`, the
stalled-jobs guide): a worker's lock must be periodically renewed while it
processes a job — *"the worker needs to periodically notify BullMQ that it is
still working on the job"* — on an interval called `lockRenewTime`, with
`lockDuration` (lock validity window) defaulting to 30000 ms and
`lockRenewTime` defaulting to half of that. The docs explicitly warn this
renewal can **fail** under one specific condition: *"heavy CPU load"* causing
*"the worker may not have time to renew the lock,"* which is *"likely to
result in the job being marked as stalled."* Stalled jobs are requeued, or
failed outright after `maxStalledCount` (default 1) stalls.

Applying this to the actual code path in this repo: `registerTaskWorker`
(`server/src/workers/task-worker.ts`) sets no custom `lockDuration` /
`lockRenewTime` on the `Worker` — defaults apply. The job handler calls
`convertDocxToPdf`, which awaits `libconvert`'s callback, which internally
calls Node's `child_process.execFile` — an **asynchronous**, non-blocking
spawn. A hung `soffice`/`soffice.bin` process therefore does **not** block
Node's event loop (unlike the "CPU-intensive synchronous work" scenario
BullMQ's docs warn about) — the event loop stays free, so BullMQ's lock-renew
timer keeps firing on schedule indefinitely, and the job is never flagged as
stalled. This is actually a stronger, more mechanically precise version of
the reviewer's claim than "BullMQ keeps renewing the lock" alone suggests: the
renewal doesn't just happen to keep working, it structurally *can't* fail
here, because the thing that's hung (the external `soffice` subprocess) is
invisible to the event-loop-based stall detector. Confirmed directly:
`server/src/workers/task-contract.ts` sets `attempts: 3` with exponential
backoff — but `attempts` only matters once a job actually fails or times out;
nothing in this repo today ever fails or times out a hung conversion, so a
truly hung `soffice` call occupies one of `WORKER_CONCURRENCY` (default `2`,
`server/src/lib/env.ts` line 48) worker slots permanently, with no BullMQ
mechanism (stalled-job detection, `attempts`, or otherwise) ever reclaiming
it.

## D. Broken template tags are accepted at upload/save, surface only at generation as "Multi error", and get retried 3×

**Verdict: Confirmed on all three sub-claims; the quoted error message format is close but not verified as an exact string from this repo's docxtemplater version.**

1. **Accepted at upload/save**: `server/src/services/document-template.service.ts`
   — both `createTemplate` (upload) and `replaceTemplateContent` (save from
   the DOCX editor) call only `assertDocxBuffer(content)` (line 69 and 104).
   `assertDocxBuffer` itself (`server/src/lib/docx.ts`) checks only the ZIP
   `PK` magic bytes and the presence of a `word/document.xml` part via
   `pizzip` — its own doc comment says explicitly this is *not* a template-tag
   check, and PDF conversion is explicitly called out as unsuitable for this
   purpose too ("LibreOffice nimmt auch eine reine Textdatei entgegen und
   rendert sie klaglos"). No `Docxtemplater` constructor or `.render()` call
   happens anywhere in the upload/save path. Confirmed: a template with a
   syntactically broken tag passes upload/save unchanged today.
2. **Surfaces at generation**: `server/src/pipelines/offer/actions.ts::generateAction`
   (and the parallel `order/actions.ts`) is the first and only place
   `new Docxtemplater(zip, {...})` and `doc.render(formatedData)` are called
   for a given template, and this only runs when a document is actually
   generated for an offer/order, not at template-management time.
3. **"Multi error" and retried 3×**: docxtemplater's own docs
   (docxtemplater.com/docs/errors, fetched) confirm it normally throws one
   wrapping error whose `.message` is literally `"Multi error"` (`name:
   TemplateError`, `id: multi_error`), with individual problems readable from
   `e.properties.errors`. The docs also distinguish constructor-time errors
   (`new Docxtemplater(...)`, e.g. malformed template structure/unclosed tags)
   from render-time errors (`doc.render()`, e.g. data-resolution failures) —
   both are plausible failure points in `generateAction`, and neither is
   caught or special-cased there: `runPipeline` (`server/src/pipelines/pipeline.ts`)
   wraps each stage in a generic `try { ... } catch { log; rethrow }`, with no
   error-type branching. The thrown error propagates to BullMQ's worker
   handler, which has no `UnrecoverableError`-style classification anywhere
   in the repo (confirmed: `grep -rn "UnrecoverableError"` across
   `server/src` returns nothing). `taskJobOptions` (`server/src/workers/task-contract.ts`)
   sets `attempts: 3` with exponential backoff, applying uniformly regardless
   of whether the failure is a permanently-broken template (which will fail
   identically on every retry) or a transient issue — so yes, a broken-tag
   failure is retried up to 3 times today.
4. **Exact error-message wording**: the reviewer's example, `The tag
   beginning with "{orderId" is unclosed`, closely matches docxtemplater's
   documented pattern for the `unclosed_tag` error id — the docs' own stated
   explanation template is `"The tag beginning with '...' is unclosed"` (shown
   against a different example tag in the docs' own sample). The *unopened*-tag
   variant's documented explanation literally interpolates the tag text the
   same way: `` `The tag beginning with "${options.xtag.substr(0, 30)}" is
   unopened` ``. This is consistent with — but not a verified exact quote of —
   the specific `"{orderId" is unclosed` string, since that depends on
   docxtemplater's exact installed version's message template and the exact
   malformed tag used to reproduce it, neither of which this check reran
   against the live library.

Also confirmed: `grep -rn "INVALID_TEMPLATE" server/src` returns nothing —
only `INVALID_DOCX` (the existing magic-byte-check error code) exists today,
consistent with `INVALID_TEMPLATE` being new in the reviewer's patch rather
than already present.

## E. Gotenberg as a sidecar recommendation

**Verdict: Confirmed as a real, documented, commonly-used pattern — not an invented tool.**

Gotenberg's own GitHub README (github.com/gotenberg/gotenberg, fetched)
describes it plainly as *"A Docker-based API for converting documents to
PDF,"* run as a standalone container (`docker run --rm -p 3000:3000
gotenberg/gotenberg:8`) that other applications call over HTTP
(`multipart/form-data` in, PDF back), explicitly wrapping both Chromium
(HTML/URL/Markdown → PDF) and LibreOffice ("Office document conversion ...
100+ formats"). Its own README states *"No need to manage Chromium,
LibreOffice, or fonts yourself"* — i.e., font-bundling is an explicitly
advertised part of its value proposition, matching the reviewer's framing.
This check could not reach `gotenberg.dev`'s own routes/configuration pages
directly (both attempted URLs 404'd — the docs site's path structure has
likely changed since whatever indexed copies exist), so the specific claims
about Gotenberg's *own* timeout/webhook/retry configuration flags were not
independently re-verified against its current docs; the project's existence,
its "HTTP API sidecar wrapping LibreOffice" architecture, and its
fonts-are-handled-for-you framing are confirmed via its README. Separately,
Gotenberg's public release notes (github.com/thecodingmachine/gotenberg
releases, referenced via search) describe a change where a LibreOffice/Chromium
renderer crash now fails fast with an HTTP 503 instead of hanging until the
request timeout — corroborating that timeout/crash handling is a real,
actively maintained concern in that project, consistent with the reviewer's
"its own timeouts, restarts" framing.

## F. Repo cleanup claims

**Verdict: Confirmed — checked directly against `git ls-files` / `git log` in this worktree, no external source needed.**

- **`.~lock.<name>.docx#` lock files**: `server/assets/templates/.~lock.order.docx#`
  **is currently tracked in git** (`git ls-files` lists it) **and currently
  present on disk** (`ls -la server/assets/templates/` shows it, dated today).
  `server/assets/templates/.~lock.offer.docx#` has a long history of being
  repeatedly added and deleted across many commits (`git log --follow` shows
  ~18 touching commits going back to early pipeline-rewrite commits; `git log
  --diff-filter=D` shows 3 deletion events), and is **not currently tracked**
  — so the offer lock file has been cleaned up at some point in history, but
  the order lock file has not and remains tracked today. The reviewer's claim
  is correct for the repo's current state (at least one LibreOffice lock file
  is tracked and present), with the nuance that it isn't uniformly true across
  both templates.
- **Backup `.docx` files**: `server/assets/templates/offer_backup.docx`,
  `offer_backup2.docx`, and `offer_backup3.docx` are all currently tracked in
  git (`git ls-files`). Confirmed.
- **`invoice copy.docx`**: `server/assets/templates/invoice copy.docx` is
  currently tracked in git (`git ls-files`). Confirmed, exact filename match
  including the space.
- **Committed `shared/dist`**: `git ls-files | grep '^shared/dist'` returns
  the full compiled output (`shared/dist/*.js`, `*.d.ts`, `*.js.map`,
  `*.d.ts.map` for every schema module — `cloud`, `common`, `contact.schema`,
  `contract.schema`, ... `user.schema`). This is build output from
  `pnpm --filter @keepit/schemas build` (per `Dockerfile` line 17) committed
  to source control rather than `.gitignore`d. Confirmed.

## G. "start:api" / "start:worker" already exist

**Verdict: Confirmed.** `server/package.json` scripts: `"start": "node
dist/server.js"`, `"start:api": "node dist/api.js"`, `"start:worker": "node
dist/worker.js"` (lines 16–18). The current `Dockerfile`'s `CMD` runs the
combined `dist/server.js` (comment on line 55: *"API + Worker in einem
Prozess; getrennter Betrieb überschreibt das Kommando"* — "API + worker in one
process; running them separately overrides the command") — i.e. the scripts
to split them already exist and are designed to be used this way, matching
the reviewer's claim exactly, but splitting into separate containers in
production is not yet done (the Dockerfile ships one combined-process image).

## H. "All 50 server tests pass, 7 of them new" / new `lib/docx.test.ts`

**Verdict: Unverifiable** — the patch/ZIP was not available to this check,
only the reviewer's prose. What can be confirmed from the current repo alone:
there is no `lib/docx.test.ts` today (`find . -iname "docx.test.ts"` returns
nothing), and the server currently has 8 `*.test.ts` files
(`server/src/runtime/shutdown.test.ts`, `entrypoints.test.ts`,
`server/src/lib/document.test.ts`, `services/contract.service.test.ts`,
`services/order-postgres.test.ts`, `services/order-source.test.ts`,
`test/order-migration.test.ts`, `services/offer/offer-pricing.test.ts`), run
via `vitest run` (`server/package.json`, `"test": "vitest run"`). Whether
applying the patch actually yields "50 passing, 7 new" cannot be checked
without the patch itself.

## Summary table

| Claim | Verdict |
|---|---|
| A. Fonts dropped by `--no-install-recommends` | Confirmed |
| B. `soffice` wrapper vs `soffice.bin`, killing wrapper leaves orphan | Confirmed (and currently moot since nothing kills anything today) |
| C. BullMQ keeps renewing the lock on a hung conversion | Confirmed, precise mechanism: async child-process hang doesn't block the event loop, so renewal never fails |
| D. Broken templates accepted at upload/save, fail as "Multi error" at generation, retried 3× | Confirmed; exact quoted error string plausible but not independently reproduced |
| E. Gotenberg is a real documented LibreOffice/Chromium HTTP sidecar with font-bundling | Confirmed (README); its own timeout/webhook config not independently re-verified (docs site 404s) |
| F. Repo cleanup items (lock files, backups, invoice copy, shared/dist) | Confirmed, all currently tracked in git except `.~lock.offer.docx#` (historically tracked, not currently) |
| G. `start:api`/`start:worker` already exist | Confirmed |
| H. "50 tests pass, 7 new" | Unverifiable (no patch access) |

## Sources

- Debian package metadata: packages.debian.org/bookworm/libreoffice,
  packages.debian.org/bookworm/libreoffice-writer,
  packages.debian.org/trixie/libreoffice (fetched 2026-10-14)
- Red Hat blog, "liberation fonts": redhat.com/en/about/blog/liberation-fonts
- LibreOffice/OpenOffice bug trackers on wrapper-vs-`.bin` process behavior:
  bugs.freedesktop.org/show_bug.cgi?id=49432,
  bz-he-de.apache.org/ooo/show_bug.cgi?id=39390
- BullMQ docs, stalled jobs / lock renewal: docs.bullmq.io (workers/stalled
  jobs guide)
- docxtemplater docs: docxtemplater.com/docs/errors (MultiError, TemplateError
  vs RenderingError, unclosed/unopened tag message templates)
- Gotenberg: github.com/gotenberg/gotenberg (README), gotenberg/gotenberg
  release notes (renderer-crash-fails-fast change)
- Repo files read directly in this worktree: `Dockerfile`,
  `server/src/lib/docx-to-pdf.ts`, `server/src/lib/docx.ts`,
  `server/src/pipelines/offer/actions.ts`, `server/src/pipelines/order/actions.ts`,
  `server/src/pipelines/pipeline.ts`, `server/src/workers/task-worker.ts`,
  `server/src/workers/task-contract.ts`, `server/src/workers/task-lifecycle.ts`,
  `server/src/runtime/worker-runtime.ts`, `server/src/lib/redis.ts`,
  `server/src/lib/env.ts`, `server/src/services/document-template.service.ts`,
  `server/package.json`, `docker-entrypoint.sh`,
  `node_modules/libreoffice-convert/index.js` (installed v1.8.1 source,
  resolved from the workspace root)
- `git ls-files`, `git log --follow --oneline`, `git log --diff-filter=D`
  against this worktree's checkout for section F.
