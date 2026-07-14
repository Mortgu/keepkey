# Plan: Einstellungsseite (Vorlagen + Profil & Konto) + Linear-Ticket

## Context

Die Settings-Seite (`/settings`) existiert nur als Stub: eine Karte „Vorlagen verwalten", die Nextcloud-`/Templates` listet, deren Upload-/Refresh-Buttons aber nicht angebunden sind. Der User möchte die Seite zu einer echten Einstellungsseite ausbauen — Scope (vom User bestätigt): **(1) Vorlagen verwalten fertigstellen** (Upload, Download, Löschen, Refresh) und **(2) Profil & Konto** (eigenes Profil bearbeiten, E-Mail und Passwort ändern via better-auth). Nicht im Scope: Org-weite Settings, Sprach-Persistenz, Theme.

Zusätzlich soll **ein Linear-Ticket** mit diesem Gesamtplan angelegt werden (ein einzelnes Ticket, kein Split). Achtung: Der Linear-Connector ist auf Org-Ebene verbunden, aber in dieser Session noch `enabledInChat: false` — falls die Tools beim Ausführen weiterhin nicht verfügbar sind, wird der User gebeten, den Connector für diesen Chat zu aktivieren (Fallback: Ticket-Text als Markdown liefern zum Selbst-Einfügen).

Stack: Vite + React 19, TanStack Router (file-based, `-components/`-Konvention), TanStack Query v5, TanStack Form + Zod v4, Tailwind v4 (CSS-Var-Tokens), eigene Komponenten (`client/src/components/`), better-auth; Server: Express 5 + Prisma 7, Nextcloud/WebDAV (`server/src/lib/nextcloud.ts`).

## Verifizierte Fakten (aus dem Code)

- `server/src/routes/nextcloud-router.ts` ist GET-only und hat unten einen Catch-all `GET /:id` → neue `/templates`-Routen **davor** registrieren. Mount: `/api/cloud` hinter `requireSession`.
- `server/src/lib/nextcloud.ts`: `getNextCloudClient()` (webdav: `putFileContents`, `deleteFile`) und `downloadDocumentStream()` existieren. Kein multer → Upload via routen-lokalem `express.raw()` (keine neue Dependency).
- Download-Pattern existiert: `<a href={BASE_URL + ...} download>` (`offer-card-document.tsx`) + Stream-Pipe mit `Content-Disposition` (`offer.controller.ts:28-43`).
- `server/src/lib/auth.ts`: `emailAndPassword.enabled: true`, aber **kein `user.changeEmail`** → muss aktiviert werden. `changePassword`/`updateUser` brauchen keine Serveränderung (Client hat `inferAdditionalFields` für salutation/firstName/lastName/phone).
- `name`-Konvention: `` `${firstName} ${lastName}` `` (`user.service.ts:65`, `user-modal.tsx:58`).
- User werden unverifiziert angelegt (kein Mailer) → `changeEmail` greift sofort (better-auth verlangt Mailer nur bei verifizierten Usern — Caveat als Kommentar dokumentieren).
- Session-Query-Key `["session"]` (auth context) → nach Profil-/E-Mail-Änderung invalidieren.
- `-page.tsx` hat einen Rules-of-Hooks-Bug (early return vor `useEffect`) — wird durch den Umbau behoben.
- Docx-Pipelines lesen Templates aus lokalem `env.TEMPLATES_DIR`, nicht Nextcloud; neues Env `NEXTCLOUD_TEMPLATES_PATH` (Default `/Templates`) hält Mutationspfade serverseitig kontrolliert.

## Teil A — Server: Template-Endpoints (Service → Controller → Router)

1. **`server/src/lib/env.ts`**: `NEXTCLOUD_TEMPLATES_PATH: z.string().default('/Templates')`.
2. **`server/src/services/nextcloud.service.ts`**: `getTemplates()`, `uploadTemplate(filename, buffer)` (`putFileContents(..., { overwrite: false })`, bei Konflikt `AppException("Vorlage existiert bereits!", 409, "TEMPLATE_EXISTS")`, leerer Buffer → 400), `deleteTemplate(filename)` (webdav-404 → 404 `TEMPLATE_NOT_FOUND`), `downloadTemplate(filename)` (Stream + docx-Content-Type). Gemeinsamer Guard `assertTemplateFilename()`: kein `/`, `\`, `..`, nicht leer, muss auf `.docx` enden, sonst 400 `INVALID_FILENAME`.
3. **`server/src/controllers/nextcloud.controller.ts`** (+ Export in `controllers/index.ts`): vier Handler; Download kopiert das Header/Pipe-Pattern aus `offer.controller.ts`.
4. **`server/src/routes/nextcloud-router.ts`** — oberhalb von `GET /:id`:
   - `GET /templates`
   - `POST /templates?filename=` mit `express.raw({ type: () => true, limit: '25mb' })`
   - `GET /templates/:filename/download`
   - `DELETE /templates/:filename`
   (kein `validate()` — Body ist binär; Validierung im Service. `express.raw` ist routen-lokal, globales `express.json()` bleibt unberührt.)

## Teil B — Client: Template-UI

5. **`client/src/data/nextcloud.ts`**: `getTemplatesAction`, `uploadTemplateAction(file)` (rohes `File` als Body, Dateiname als Query-Param), `deleteTemplateAction(basename)`, `templateDownloadUrl(basename)`.
6. **`client/src/hooks/nextcloud-hook.ts`**: `useGetTemplates` (Key `["cloud","templates"]`), `useUploadTemplate`/`useDeleteTemplate` als Mutations im Stil von `customer-mutations.ts`, `onSuccess` invalidiert `["cloud","templates"]`.
7. **`client/src/routes/_main/settings/-components/template-list.tsx`** (Rewrite, self-fetching Karte):
   - Hidden `<input type="file" accept=".docx">` hinter „Hochladen"; Client-Guard auf `.docx`; Toasts „Vorlage hochgeladen"/„Vorlage gelöscht"; Refresh via `refetch()`.
   - Pro Zeile (fehlendes `key` fixen): Name, Größe, Download-Anchor (Pattern `offer-card-document.tsx`), Trash-Button mit `ModalDialog`-Confirm („Möchten Sie die Vorlage ‚…' wirklich löschen?").
   - `useNextcloudStatus()`: wenn nicht verbunden → Hinweis „Nextcloud ist nicht konfiguriert.", Aktionen disabled. Empty state: „Keine Vorlagen vorhanden."

## Teil C — Profil & Konto (better-auth Client-APIs)

8. **`server/src/lib/auth.ts`** (einzige Serveränderung hier): `user: { changeEmail: { enabled: true }, additionalFields: …unverändert }`.
9. **Neue Komponenten** (Form-Pattern aus `customer-modal.tsx`: `useForm` + Zod-`onChange`-Validator + `getFormError`):
   - `profile-form.tsx` — Anrede/Vorname/Nachname/Telefon → `authClient.updateUser({ name: \`${firstName} ${lastName}\`, salutation, firstName, lastName, phone })` → `["session"]` invalidieren, Toast „Profil gespeichert".
   - `email-form.tsx` — aktuelle E-Mail read-only + „Neue E-Mail-Adresse" (`z.email`) → `authClient.changeEmail({ newEmail })` → invalidieren + Toast.
   - `password-form.tsx` — Aktuelles/Neues/Wiederholen (min 8, Match-Check „Passwörter stimmen nicht überein!") → `authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: true })` → `form.reset()`, Toast „Passwort geändert".
10. **`client/src/routes/_main/settings/-page.tsx`** (Rewrite, reine Komposition, behebt Hooks-Bug):
    `<PageWidth>` → H1 „Einstellungen" → `ProfileForm` → zweispaltig `EmailForm`+`PasswordForm` → `TemplateList`. Karten-Styling wie bisher (`border border-(--border) p-4 bg-(--page-bg) rounded-md shadow-sm`), optional kleiner lokaler `SettingsCard`-Wrapper.

## Teil D — Linear-Ticket

11. Linear-Tools prüfen (ToolSearch/ListConnectors). Falls verfügbar: **ein** Issue anlegen — Titel „Einstellungsseite: Vorlagenverwaltung fertigstellen + Profil & Konto", Beschreibung = komprimierte Fassung dieses Plans (Scope, Teil A–C, Verifikation); Team/Projekt: das einzige/naheliegende Team wählen, bei Mehrdeutigkeit User fragen.
12. Falls Tools weiterhin nicht geladen: User bitten, den Connector für diesen Chat zu aktivieren; Ticket-Markdown als Fallback bereitstellen.

## Reihenfolge

A1→A2→A3→A4, dann B1→B2→B3→C5(Seite), dann C1→C2→C3→C4, dann Verifikation, dann Teil D. Commits auf Branch `claude/linear-mcp-access-ou9r9u`, Push mit `git push -u origin`.

## Verifikation

1. `make install`; `make docker-up` (Postgres/Redis); `server/.env` mit DB/Redis/better-auth + `NEXTCLOUD_URL/USER/PASSWORD` prüfen.
2. `make dev`; Login mit Seed-User (`npm --prefix server run seed` falls nötig).
3. Templates E2E: Liste; `.docx`-Upload (Zeile + Toast); Duplikat → 409-Toast; `.pdf` → client- und serverseitig geblockt; Download streamt mit korrektem Dateinamen; Löschen mit Confirm; Refresh. Catch-all `GET /api/cloud/:id` (Offer-Dateien) weiterhin funktionsfähig (Routen-Reihenfolge!).
4. Profil: Vorname/Telefon ändern → Anzeige aktualisiert nach `["session"]`-Invalidation; DB-`name` = „Vorname Nachname".
5. E-Mail ändern → Re-Login mit neuer Adresse. Passwort: falsches aktuelles PW → Fehler-Toast; korrekt → Re-Login mit neuem PW.
6. `npm --prefix server run test`, `npm --prefix client run build`, `npm --prefix server run build`.
