# Document generation: ODT migration vs. PDF-only — research

Status: research only, no recommendation. Written to compare two architecture
options the team is weighing against the current `.docx`-based pipeline.
Business/product calls that this research cannot settle are listed at the end.

## 1. Current state (baseline, already confirmed by reading the repo)

- **Templating**: `docxtemplater` v3.71.0 + `pizzip` v3.2.0 fill `.docx` templates
  in `server/src/lib/render-document.ts`; `angular-expressions` v1.4.3 backs the
  expression parser (`customParser` in `server/src/pipelines/offer/utils.ts`).
  Tag types used: plain placeholders `{tag}`, loops `{#x}...{/x}`, conditions
  `{#cond}...{/cond}` — confirmed against docxtemplater's own tag-type docs
  (docxtemplater.com/docs/tag-types/, retrieved 2026-10-14).
- **Template validation**: `server/src/lib/docx.ts` (`assertDocxBuffer`) checks
  for the ZIP `PK` magic bytes and a `word/document.xml` part via `pizzip`,
  with an explicit code comment that PDF conversion is too lenient to serve as
  a validity check (LibreOffice will happily "convert" a plain text file).
- **Content-control reading**: `server/src/lib/docx-controls.ts`
  (`readContentControls`, walking `w:sdt` / `w:sdtPr` / `w:tag` nodes) and
  `server/src/lib/docx-text.ts` (`readDocumentLines`, `paragraphLine`,
  `cellText`, `walk`) — both hand-written against OOXML's WordprocessingML
  element names (`w:p`, `w:tr`, `w:tc`, `w:pPr`, `w:numPr`, `w:sdt`, etc.) via
  the shared XML helpers in `server/src/lib/docx-xml.ts`.
- **Provenance/hashing**: `server/src/lib/docx-provenance.ts`
  (`canonicalJson`, `hashModel`, `readProvenance`/`writeProvenance`) embeds a
  `keepit.*` triple (`documentType`, `documentId`, `modelHash`) into
  `docProps/custom.xml`, OOXML's custom document-properties part, to detect
  drift and support "replacement" uploads.
- **Replacement/adoption logic**: `server/src/lib/replacement-check.ts`
  (`checkReplacement`, `diffControls`, `withAdoptedValue`) compares a
  re-uploaded `.docx`'s content controls against the stored model;
  `server/src/services/offer/adopt-document-changes.ts` (`adoptChanges`) writes
  accepted field diffs back into the Offer; `server/src/services/document/document-replacement.ts`
  (`createReplacementUpload`, `confirmReplacementUpload`, `inspectReplacement`)
  orchestrates the upload-a-new-docx flow, including re-converting the
  replacement to PDF.
- **Template storage**: `../../server/src/services/document/document-template.service.ts`
  stores uploaded `.docx` templates in object storage keyed
  `templates/<kind>/<uuid>.docx`, one active template per
  `(DocumentTemplateKind, Language)`, with a legacy on-disk fallback
  (`loadTemplateForRendering`).
- **PDF conversion**: `server/src/lib/docx-to-pdf.ts` (`convertDocxToPdf`)
  shells out to LibreOffice via the `libreoffice-convert` npm package v1.8.1;
  the code comment notes this runs a `soffice` subprocess and "takes seconds,
  longer on cold start."
- **Rendering orchestration**: `server/src/lib/render-document.ts`
  (`renderDocument`) always produces *both* a `docxBuffer` and a `pdfBuffer`
  from one template fill, plus a `modelHash`, and includes `warnOnTemplateDrift`
  (compares template tags against the Zod data schema).
- **End-user flow**: documents are downloadable as both DOCX and PDF; a user
  can edit the DOCX and re-upload it as a "replacement," which is diffed
  against content controls and optionally "adopted" back into the source
  Offer (`adoptChanges`).

## 2. Option A — switch templates/generation from `.docx` to `.odt`

### 2.1 odf-kit (the library the user flagged)

Primary sources: the guide page itself
(https://githubnewbie0.github.io/odf-kit/guides/fill-odt-template-javascript.html,
retrieved 2026-10-14), the GitHub repo
(https://github.com/GitHubNewbie0/odf-kit) and the npm registry
(https://registry.npmjs.org/odf-kit).

- **What it is**: a TypeScript/JavaScript library, described in its own repo
  as generating, filling, reading, and converting OpenDocument files (`.odt`,
  `.ods`), including conversion *from* DOCX/XLSX/HTML/Markdown/TipTap
  JSON/Lexical JSON into ODF. The repo explicitly advertises "No LibreOffice
  dependency."
- **Author/maintenance**: author/npm account is `GitHubNewbie0` (npm
  maintainer listed as `npmnewbie0`). Repo: 31 stars, 4 forks, 432 commits on
  main, 4 open issues, 5 open pull requests (retrieved 2026-10-14; the GitHub
  page did not surface a last-commit date or contributor count in the fetch).
  This is a small, single/few-maintainer project, not an established project
  with a large user base — weigh accordingly.
- **License**: Apache 2.0 (LICENSE file present in repo).
- **npm package**: `odf-kit`, latest version `0.14.4` per the npm registry API
  (`registry.npmjs.org/odf-kit`, dist-tags). I could not retrieve weekly
  download counts or the exact last-publish timestamp — the npmjs.com package
  page itself returned HTTP 403 to automated fetches, and a web search turned
  up no third-party mirror with current numbers. **Flagged as unverified**:
  treat downloads/recency as unknown rather than assuming either way; check
  `https://api.npmjs.org/downloads/point/last-week/odf-kit` directly before
  relying on popularity as a signal.
- **Templating syntax** (per the guide page and README): `{tag}` placeholders,
  dot notation (`{object.property}`), loops (`{#items}...{/items}`),
  conditionals (`{#flag}...{/flag}`, falsy removes the block). Values are
  XML-escaped automatically, and the library includes a "placeholder healer"
  that repairs placeholders LibreOffice splits across XML runs — a real and
  known problem class for ODT/DOCX text replacement generally (any run-level
  WYSIWYG editor can fragment a placeholder's characters across multiple XML
  text nodes mid-save).
- **Images**: per the README, embeds base64 data URLs; remote images resolved
  via a pre-supplied `images` map or an async `fetchImage` callback; an image
  with no resolution path is skipped (not an error).
- **Tables**: README describes support for simple arrays and a builder API
  with column widths/borders, which is a smaller surface than docxtemplater's
  dedicated table module (HTML-to-table, loop-to-rows, loop-to-columns — see
  2.2).
- **Net read**: odf-kit is capability-comparable to docxtemplater's *free
  core* (placeholders/loops/conditionals/images/tables) for ODT specifically,
  but it is a young, low-adoption library maintained by what looks like one
  person, with primary documentation hosted as a personal GitHub Pages site
  rather than a conventional project site. That is a materially different
  maintenance-risk profile than docxtemplater (established, dual-licensed,
  commercially supported).

### 2.2 docxtemplater's own ODT support (lower-migration-cost sub-option)

Primary sources: docxtemplater.com/modules/ (module list),
docxtemplater.com/modules/odt/ (ODT module page), docxtemplater.com/pricing/,
and docxtemplater.com/ (feature overview) — all retrieved 2026-10-14.

- **Yes, it exists.** docxtemplater ships a dedicated **ODT module**
  (`docxtemplater-odt-module` on npm) that lets the *same* docxtemplater
  engine fill `.odt` files produced by LibreOffice Writer, using the same
  tag syntax (`{name}`, loops `{#users}{name}{/}`, `paragraphLoop` option, and
  the same pluggable `parser` option — so the existing `angular-expressions`
  / `customParser` setup in `render-document.ts` would carry over unchanged).
- **It is not free.** The ODT module page states it "is available as part of
  the Docxtemplater ENTREPRISE plan." Per the pricing page: Free tier (MIT,
  core only: tag replacement, conditions, loops, delimiter changes) → One
  Module tier at **€500/year** (ODT counts as one module here) → PRO at
  €1,250/year (up to 4 modules) → Enterprise at €3,000/year (all ~18-19
  modules, includes a Docker image for HTTP-based generation) → Premium at
  €9,000/year (adds a browser build, dev time, monthly call).
- **Feature gap vs. the docx path**: the ODT module's own page documents only
  tag replacement, loops, `paragraphLoop`, and the parser option — it does
  not mention conditionals, raw-XML tags, images, or tables as ODT-module
  features (docxtemplater's free-core conditionals might still apply since
  ODT module composes with core — not stated either way on the page, so
  **flagged as unverified**: confirm with docxtemplater support/docs before
  assuming conditionals work identically on ODT). Images and tables are
  themselves *separate* paid modules in docxtemplater's docs/modules listing
  (`image`, `table`, `html`, `xlsx`, `chart`, `subtemplate`, etc.), and it is
  not documented whether those modules are compatible with ODT output at all
  — treat image/table support for the ODT path as unconfirmed.
- **Why this matters for the migration-cost comparison**: adopting
  docxtemplater's ODT module keeps the same library, the same parser, the
  same call shape in `render-document.ts` (swap the loaded template and the
  Docxtemplater `modules` array), and the same `docx-provenance.ts` approach
  conceptually (ODF has its own custom-metadata mechanism — see 2.4). That is
  a materially smaller migration than adopting a third-party library like
  odf-kit, at a recurring license cost (≥€500/year) instead of zero.

### 2.3 LibreOffice / `libreoffice-convert` → PDF, for `.odt` inputs

Primary sources: LibreOffice's own help pages
(help.libreoffice.org/latest/en-US/text/shared/00/00000021.html, "XML File
Formats", retrieved 2026-10-14) and the `libreoffice-convert` README pinned at
v1.8.1 (cdn.jsdelivr.net/npm/libreoffice-convert@1.8.1/Readme.md).

- LibreOffice's own documentation states plainly: "By default, LibreOffice
  loads and saves files in the OpenDocument file format." ODF files
  (`.odt`/`.ods`/`.odp`/`.odg`/`.odb`) are described as "compressed zip
  archives that contain XML files," with `content.xml` holding the document
  body, `meta.xml` metadata, `settings.xml` settings, `styles.xml` styles, and
  `META-INF/manifest.xml` the package manifest. ODF 1.2 is the current default
  save version in older releases, with ODF 1.4 as the newest supported
  standard (first in LibreOffice 25.2 per the same page).
- Because ODF is LibreOffice's native format, converting `.odt → .pdf` is
  loading-then-exporting in LibreOffice's own format rather than first
  interpreting a foreign format (OOXML) and re-rendering it — which is the
  conversion keepkey already relies on for `.docx → .pdf` today. The
  `libreoffice-convert` README does not benchmark or compare `.odt` vs
  `.docx` conversion speed (no such claim was found in the README), so the
  "should be faster/more reliable" framing in the task brief is a reasonable
  inference from LibreOffice owning both ends of the `.odt` pipeline, **not**
  a documented, measured fact — flagged as unverified pending an actual
  benchmark on your own templates.
- `libreoffice-convert`'s README itself is thin: it describes itself only as
  "a simple and fast node.js module for converting office documents to
  different formats," shows a `.docx → .pdf` example, requires a local
  LibreOffice/soffice install, and does not enumerate supported format pairs
  or name the `soffice` binary/command explicitly. It also does not document
  `.odt` support one way or the other, though LibreOffice/`soffice`'s general
  `--convert-to` CLI mechanism (which this package wraps) handles any format
  LibreOffice itself can open and export, which includes `.odt → .pdf`
  natively, per the ODF-is-native documentation above — this is inference
  from LibreOffice's own docs, not a direct claim by the npm package's
  README.

### 2.4 What would NOT carry over cleanly

This part is architecture reasoning done by reading the actual repo files,
not docs research.

- **`server/src/lib/docx-controls.ts`** (`readContentControls`,
  `collect`) walks `w:sdt` / `w:sdtPr` / `w:tag` / `w:sdtContent` /
  `w:showingPlcHdr` — these are WordprocessingML-specific content-control
  elements defined by OOXML (ECMA-376 Part 1, WordprocessingML). ODF has no
  direct equivalent concept with the same semantics; OpenDocument has
  `text:placeholder` and form-control elements in a different part of its
  schema, and no "tagged content control with a hidden show/hide placeholder
  flag" primitive. This file would need a genuine rewrite against
  `content.xml`'s element names, not a search-and-replace of tag strings.
- **`server/src/lib/docx-text.ts`** (`readDocumentLines`, `paragraphLine`,
  `cellText`, `walk`) walks `w:p`, `w:pPr`, `w:numPr`, `w:ilvl`, `w:tr`,
  `w:tc` — again WordprocessingML paragraph/numbering/table element names.
  ODF's equivalents are `text:p`, `text:list-item`/`text:list`,
  `table:table-row`, `table:table-cell`, under a different namespace and
  nesting model (ODF list numbering is structural — nested `text:list`
  elements — rather than a `w:numPr` property on each paragraph). This is a
  rewrite, not a port.
- **`server/src/lib/docx-provenance.ts`** writes into
  `docProps/custom.xml`, which is OOXML's Custom Properties part
  (`http://schemas.openxmlformats.org/officeDocument/2006/custom-properties`).
  ODF's equivalent metadata mechanism is `meta.xml`'s
  `<meta:user-defined>` elements, a structurally different format (OASIS ODF
  v1.3, §meta.xml descriptions per LibreOffice's own "XML File Formats" page
  above, which documents `meta.xml` as holding document metadata). The
  canonicalization/hashing logic (`canonicalJson`, `hashModel`) is
  format-agnostic and portable as-is; only the read/write-into-the-zip-part
  functions need rewriting.
- **`server/src/lib/replacement-check.ts`** (`diffControls`,
  `checkReplacement`, `withAdoptedValue`) is logic built *on top of*
  `readContentControls`/`readProvenance`; it would need no conceptual
  rewrite, but it is dead in the water until the two files above are ported,
  since it imports and calls them directly.
- **Schema divergence, at the spec level**: OOXML is standardized as
  ECMA-376 ("Office Open XML File Formats," 5th edition, Dec 2021,
  ecma-international.org/publications-and-standards/standards/ecma-376/),
  itself in four parts (Fundamentals/Markup Language Reference; Open
  Packaging Conventions; Markup Compatibility and Extensibility; Transitional
  Migration Features) and also ISO/IEC 29500. ODF is standardized separately
  by OASIS as the OpenDocument Format (currently ODF 1.3 as an OASIS
  Standard, oasis-open.org; also ISO/IEC 26300). They are two independent,
  differently-governed XML vocabularies with different element names,
  namespaces, and package-part layouts (`word/document.xml` + `docProps/*`
  vs. `content.xml` + `meta.xml` + `styles.xml` + `settings.xml` +
  `META-INF/manifest.xml`) — not two dialects of one schema. I could not find
  a neutral, up-to-date, primary-source clause-by-clause diff between the two
  specs (web search turned up only advocacy pieces from the mid-2000s ODF-vs-
  OOXML standardization fight); the structural facts above come directly from
  each format's own current primary documentation (LibreOffice's XML File
  Formats help page for ODF's parts; ECMA-376's own publication page for
  OOXML's parts), not from a comparative source.

### 2.5 Practical adoption concern: Microsoft Word's ODF support

Primary source: Microsoft's own support article, "Differences between the
OpenDocument Text (.odt) format and the Word (.docx) format"
(support.microsoft.com/en-US/Word/differences-between-the-opendocument-text-odt-format-and-the-word-docx-format-used-by-word-for-the-w,
retrieved 2026-10-14), plus Microsoft's Insider blog on ODF 1.3/1.4 support.

- Word can open and save `.odt` (File > Save As > "OpenDocument Text
  (*.odt)"), and current Microsoft 365 builds support ODF 1.3, with ODF 1.4
  support reported in Current Channel builds (older ODF 1.3-and-earlier files
  reportedly need re-saving as 1.4 to open in those builds, per Microsoft's
  Insider post — this is from a blog post, not the support article itself,
  flagged as the weaker of the two sources here).
- Microsoft's own support article lists a long, explicit set of fidelity
  losses when round-tripping through `.odt`, including (non-exhaustive, see
  source for the full table): **track changes are not preserved — "all
  changes are accepted"** on saving to `.odt`; document protection/IRM is
  dropped and such files can't be reopened; themes and watermarks are
  unsupported; highlighting becomes character background color; positional
  tabs are unsupported; tables over 64 columns are unsupported; SmartArt and
  nested shapes/text boxes are lost; charts become ungrouped object groups;
  embedded OLE objects from non-Word ODF producers may not display; and
  continuous section breaks can lose margins/headers/footers/borders.
- **Implication for keepkey specifically**: the "adopt changes" flow assumes
  a user opens the generated file in Word, edits specific field values (which
  live in content controls today), and re-uploads it for diffing. Track-
  changes loss is not directly relevant to keepkey's flow (it doesn't appear
  to rely on tracked changes), but the broader fidelity-loss list signals
  that `.odt` round-tripping through Word is not lossless, and Word's `.odt`
  support is explicitly a compatibility/export feature, not Word's native
  mode — this is Microsoft's own characterization of the relationship, not
  an inference.

## 3. Option B — remove `.docx` generation, produce PDF only

### 3.1 What becomes dead code vs. what survives (read directly from the repo)

**Would become dead code or need substantial trimming** if keepkey stops
producing an editable `.docx` output and stops accepting re-uploaded `.docx`
replacements/adoptions:

- `server/src/lib/docx-controls.ts` (`readContentControls`) — exists solely
  to read back values a human edited inside a Word content control. With no
  editable output, there's nothing to read back.
- `server/src/lib/docx-text.ts` (`readDocumentLines`) — per its own doc
  comment, exists "for tests that pin down a rendered document" as readable
  text; this is test tooling tied to inspecting generated `.docx` content,
  would lose its purpose if `.docx` is never produced for users (though some
  equivalent might still be wanted for template QA — see below).
  — confirmed by reading `server/src/lib/docx-text.ts` directly.
- `server/src/lib/docx-provenance.ts` (`writeProvenance`/`readProvenance`) —
  the explicit purpose documented in the file's own comment is "to match a
  later-uploaded DOCX to the document and model it came from" and "support
  'replacement' uploads." With no re-upload path, there is nothing to match
  provenance against. (`hashModel`/`canonicalJson` could stay if drift
  detection — `warnOnTemplateDrift` in `render-document.ts` — is still
  wanted, since that only needs the model hash, not the write-into-docx
  step.)
- `server/src/lib/replacement-check.ts` (`checkReplacement`, `diffControls`,
  `withAdoptedValue`) — this entire module exists only to diff an uploaded
  replacement `.docx` against the stored model. Confirmed by reading the
  file: every exported function takes a `docx: Buffer` or is used only by
  callers that do.
  **Note**: `server/src/lib/replacement-check.test.ts` and
  `docx-controls.test.ts` and `docx-provenance.test.ts` exist alongside these
  (seen in `ls server/src/lib/`) and would go with them.
- `server/src/services/offer/adopt-document-changes.ts` (`adoptChanges`) —
  reads a stored `.docx` artifact (`findArtifact(..., DocumentFormat.DOCX)`),
  calls `diffControls`, and writes accepted diffs back to the Offer. Entirely
  dependent on the replacement/content-control machinery above; would be
  removed wholesale. Confirmed by reading the file directly — its only
  non-trivial logic is `diffControls`/`withAdoptedValue` orchestration plus
  the optimistic-concurrency checks around it.
- `server/src/services/document/document-replacement.ts`
  (`createReplacementUpload`, `confirmReplacementUpload`,
  `inspectReplacement`, `getDocumentCapabilities`) — this whole file's reason
  for existing is "upload a replacement .docx, validate it, re-derive its
  PDF, swap both artifacts in." Confirmed by reading the file: it calls
  `assertDocxBuffer`, `checkReplacement`, `convertDocxToPdf` (to regenerate
  the PDF *from* the uploaded docx) in sequence. If there's no user-facing
  `.docx` to replace, none of this has a reason to exist.
- The `DOCUMENT_FORMAT_NOT_REPLACEABLE` / "only DOCX is replaceable, PDF is
  derived from it" logic in `requireReplaceableArtifact` — predicated
  entirely on DOCX being the editable source of truth.
- Parts of `server/src/services/document/document-lifecycle.ts`
  (`renameDocument`, `deleteDocument`, `downloadDocument`) that handle *pairs*
  of artifacts (`artifactPair`, `uploadedPair`, `moveUploadedPair` moving both
  a `.pdf` and a `.docx` on Nextcloud, rollback-on-partial-rename logic for
  the pair) would simplify to single-artifact logic — confirmed by reading
  the file: `moveUploadedPair` explicitly rolls back the PDF rename if the
  DOCX rename fails, logic that only exists because there are two files to
  keep in lockstep.
- Template-upload validation in `document-template.service.ts`
  (`assertDocxBuffer` calls) would stay only if templates themselves remain
  `.docx` (they would, under Option B as scoped — only the *output* changes,
  not the editable *template* format) — so this module is **not** dead code
  under Option B alone.

**Stays regardless of Option B:**

- `server/src/lib/render-document.ts` core templating call
  (`Docxtemplater`/`PizZip`/`customParser`) — still needed to fill the
  `.docx` *template* with data; only the final step (`doc.toBuffer()` being
  kept/stored as a deliverable) would be dropped, not the fill itself.
- `server/src/lib/docx.ts` (`assertDocxBuffer`) — still needed to validate
  uploaded *templates*, which remain `.docx` under this option.
- `server/src/lib/docx-to-pdf.ts` (`convertDocxToPdf`) — still needed; see
  3.2, this is the crux of the "does PDF-only remove LibreOffice" question.
- `../../server/src/services/document/document-template.service.ts` — template storage is
  unaffected; templates are still uploaded, stored, and activated per
  kind/language.
- `warnOnTemplateDrift` in `render-document.ts` — drift detection is about
  comparing template tags to the data schema, independent of whether the
  rendered output is kept as `.docx` or discarded after PDF conversion.

### 3.2 Does PDF-only remove the LibreOffice dependency? — No, not under the current architecture

This is the explicit "common misconception" the task asked to reason about,
and the repo confirms it directly: `server/src/lib/render-document.ts`
produces the `.docx` buffer via `docxtemplater`/`pizzip` and *then* calls
`convertDocxToPdf(docxBuffer)` (`server/src/lib/docx-to-pdf.ts`), which shells
out to `soffice` via `libreoffice-convert`. If keepkey keeps templates as
`.docx` files authored in Word (so that non-engineers can keep editing
templates visually — the stated reason `assertDocxBuffer` and the whole
template-management UI exist) and simply stops *handing the final `.docx` to
the end user*, the generation pipeline up to and including the LibreOffice
conversion step is **unchanged**. The only thing removed is the step of
*storing/serving* the `docxBuffer` as a downloadable artifact — the
LibreOffice subprocess call that is the stated source of multi-second,
cold-start-sensitive latency (per `docx-to-pdf.ts`'s own code comment) still
runs on every document generation. Dropping `.docx` output removes
LibreOffice only if templates *also* stop being Word documents and the
rendering path switches to a native PDF renderer (pdfmake/PDFKit/
@react-pdf/renderer — see 3.3) or a non-LibreOffice-based template-to-PDF tool.

### 3.3 Direct-to-PDF alternatives (primary sources: each project's own README/npm page)

| Library | Primary use case | Visual template for non-engineers? | Shells out to LibreOffice? | License |
|---|---|---|---|---|
| **pdfmake** (bpampuch/pdfmake) | Declarative, pure-JS PDF generation from a JSON-like document-definition object; README states it "is based on" PDFKit | No — content is a JS object tree (styles, tables, lists, headers/footers), not a document a non-engineer edits visually | No — pure JavaScript per its own README | MIT |
| **pdf-lib** | Creating/modifying existing PDFs programmatically (draw text/images/shapes at explicit `x`/`y` coordinates, fill form fields); runs in Node, browser, Deno, React Native | No — code-only, coordinate-based drawing API | No | MIT |
| **PDFKit** (foliojs/pdfkit) | Code-driven PDF generation via chained API calls (text, images, vector graphics, tables, annotations); README notes higher-level layout helpers are still "coming soon" | No — code-only | No | MIT |
| **@react-pdf/renderer** | React renderer that turns JSX (`Document`/`Page`/`View`/`Text` components + `StyleSheet.create`) into a PDF, in-browser or server-side | No — JSX/code-only; a different sibling project, `react-pdf`, is for *displaying* PDFs, not generating them | No | MIT |
| **Carbone** (carboneio/carbone) | Template-driven document generation: fills ordinary `.docx`/`.odt`/`.xlsx`/`.pptx`/`.html` templates (and others) authored in "the tool you already know" (Word/LibreOffice/OnlyOffice per its homepage) with `{d.field}`-style JSON placeholders, then can export to the template's own format *or* convert to PDF/100+ formats | **Yes** — the template stays an ordinary Word/LibreOffice/OnlyOffice document; this is the one option in this table aimed at non-engineer template editing | **Yes, for format conversion.** Its own README states: "Carbone uses efficiently LibreOffice to convert documents" for PDF and other output formats; without LibreOffice installed, Carbone can still output in the *same* format as the template (docx, xlsx, pptx, odt, ods, odp, html) | Community Edition under Carbone's own "CCL Agreement" (not MIT/AGPL — a custom license restricting, among other things, offering Carbone itself as a hosted Document-Generator-as-a-Service); Enterprise features are separately licensed |

Key takeaways, all directly from each project's own docs/README:

- The four non-Carbone options are **code-only renderers**: there is no
  visual template a product/ops person could open in Word and edit, which is
  a regression from keepkey's current "upload a .docx template" workflow for
  template authors (distinct from the separate question of whether *end
  users* get an editable output). Adopting any of them for the *generation*
  side would mean re-implementing every existing template's layout in code
  (pdfmake's JSON definition or React JSX), which is a rewrite of every
  template, not a swap of a rendering backend.
- None of pdfmake/pdf-lib/PDFKit/@react-pdf/renderer shells out to
  LibreOffice — they are genuinely native PDF renderers, so they *would*
  eliminate the LibreOffice dependency and its cold-start latency, but only
  by giving up visual, Word-editable templates entirely.
- **Carbone is the one tool here that is relevant to *both* options A and
  B**: it supports `.odt` templates natively (Option A-adjacent) and can
  convert to PDF via LibreOffice (same dependency keepkey has today) or skip
  conversion entirely if template format = output format. It does **not**
  remove the LibreOffice dependency for PDF output — its own README says so
  explicitly — so it does not change the answer in 3.2. Adopting Carbone
  would mean replacing docxtemplater with a different templating engine and
  a different (non-MIT) license (CCL), for a tool whose self-reported value
  proposition is unifying template format support and output conversion
  under one API, not avoiding LibreOffice.

## 4. Summary comparison

| | Current (.docx) | Option A: odf-kit | Option A: docxtemplater ODT module | Option B: PDF-only (LibreOffice path) | Option B: PDF-only (native renderer) |
|---|---|---|---|---|---|
| Template authoring | Word, visual | LibreOffice Writer, visual | LibreOffice Writer, visual | Word, visual (templates unchanged) | Code (JSON/JSX), not visual |
| Engine | docxtemplater (free core) | odf-kit (new dependency) | docxtemplater (same core + paid module) | docxtemplater (unchanged) | pdfmake/PDFKit/react-pdf (new) |
| License/cost | MIT (docxtemplater core) | Apache 2.0, free | ≥€500/yr (ODT module) | unchanged | MIT, free |
| `docx-controls.ts`/`docx-text.ts`/`docx-provenance.ts` | as-is | full rewrite against ODF schema | full rewrite against ODF schema | mostly dead code | mostly dead code |
| `replacement-check.ts`/`adopt-document-changes.ts` | as-is | rewrite (depends on above) | rewrite (depends on above) | dead code | dead code |
| LibreOffice dependency | yes (`.docx`→PDF) | yes (`.odt`→PDF, native format) | yes (`.odt`→PDF, native format) | **yes, unchanged** | **no** |
| End-user output | editable `.docx` + PDF | editable `.odt` + PDF | editable `.odt` + PDF | PDF only | PDF only |
| Word compatibility for end users | native | import/export only, documented fidelity losses (Microsoft's own support page) | same as odf-kit column | n/a (no docx given to user) | n/a |

## 5. Open questions for the team

These are business/product calls this research cannot settle from docs alone:

1. **Do end users need to keep editing the generated document themselves?**
   The "adopt changes" flow (`adoptChanges`, `confirmReplacementUpload`)
   assumes someone opens the generated file in Word and edits specific
   fields. If that workflow is no longer required, Option B's dead-code list
   (section 3.1) applies regardless of whether Option A is also pursued.
2. **If users do keep editing output, does anyone currently use LibreOffice
   or another ODF-native tool instead of Word?** If the real-world editor is
   already LibreOffice (or OnlyOffice, Collabora, etc.), Option A's Word-
   compatibility caveats (section 2.5) may not matter in practice; if it's
   Word, Microsoft's documented `.odt` fidelity losses (track changes,
   protection/IRM, themes, watermarks, etc.) become a direct product risk.
3. **Is a €500+/year recurring license acceptable for the docxtemplater ODT
   module**, versus the engineering cost of adopting/maintaining a
   dependency on a young, low-adoption library like odf-kit, versus the much
   larger engineering cost of hand-rolling ODF XML handling in-house (as
   `docx-controls.ts`/`docx-text.ts`/`docx-provenance.ts` do today for
   OOXML)?
4. **How much does template-authoring UX matter to whoever edits the base
   `.docx`/`.odt` templates** (not the generated output) — this determines
   whether Carbone or the native-PDF-renderer options in section 3.3 are
   even in scope, since only template-driven tools (current docxtemplater
   path, odf-kit, docxtemplater-ODT, Carbone) preserve visual template
   editing; pdfmake/pdf-lib/PDFKit/@react-pdf/renderer would require
   migrating every existing template into code.
5. **Is reducing LibreOffice's cold-start/per-document latency actually a
   goal of this change?** If so, section 3.2's finding — that PDF-only does
   *not* remove LibreOffice unless templates also move to a native-PDF
   renderer — means Option B alone (keeping `.docx`/`.odt` templates) will
   not achieve a latency win; only abandoning template-driven generation
   entirely (section 3.3's native renderers) would.
6. **Is there a compliance/procurement reason to prefer ODF** (e.g. public-
   sector tendering requirements that mandate ODF, common in parts of the EU)
   that would justify Option A's migration cost independent of any technical
   comparison above? This research found no such requirement mentioned
   anywhere in the repo or task description — flagging it only because it is
   a common real-world driver for ODF adoption and worth ruling in or out
   explicitly.

## Sources

- docxtemplater: https://docxtemplater.com/, /docs/tag-types/, /modules/,
  /modules/odt/, /pricing/ (retrieved 2026-10-14)
- odf-kit: https://githubnewbie0.github.io/odf-kit/guides/fill-odt-template-javascript.html,
  https://github.com/GitHubNewbie0/odf-kit, https://registry.npmjs.org/odf-kit
  (retrieved 2026-10-14)
- LibreOffice: https://help.libreoffice.org/latest/en-US/text/shared/00/00000021.html
  (retrieved 2026-10-14)
- libreoffice-convert v1.8.1 README: https://cdn.jsdelivr.net/npm/libreoffice-convert@1.8.1/Readme.md
- ECMA-376: https://ecma-international.org/publications-and-standards/standards/ecma-376/
- OASIS OpenDocument Format v1.3: https://www.oasis-open.org/standard/opendocument-v1-3-oasis-standard/
- Microsoft Word/.odt differences: https://support.microsoft.com/en-US/Word/differences-between-the-opendocument-text-odt-format-and-the-word-docx-format-used-by-word-for-the-w
- pdfmake README: https://raw.githubusercontent.com/bpampuch/pdfmake/master/README.md
- pdf-lib README: https://raw.githubusercontent.com/Hopding/pdf-lib/master/README.md
- PDFKit README: https://raw.githubusercontent.com/foliojs/pdfkit/master/README.md
- @react-pdf/renderer README: https://raw.githubusercontent.com/diegomura/react-pdf/master/README.md
- Carbone README (npm, unversioned/latest at fetch time): https://cdn.jsdelivr.net/npm/carbone/README.md,
  homepage https://carbone.io/, docs https://carbone.io/documentation.html
- Repo files read directly (paths as of this branch, `xml_test`, commit
  `8547620c` base per `graphify-out/GRAPH_REPORT.md`):
  `server/src/lib/render-document.ts`, `docx.ts`, `docx-to-pdf.ts`,
  `docx-controls.ts`, `docx-text.ts`, `docx-provenance.ts`,
  `replacement-check.ts`, `../../server/src/services/document/document-template.service.ts`,
  `server/src/services/offer/adopt-document-changes.ts`,
  `server/src/services/document/document-lifecycle.ts`,
  `server/src/services/document/document-replacement.ts`,
  `server/package.json`.
