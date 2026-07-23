# pnpm Workflow (Monorepo)

Dieses Repo ist ein pnpm-Workspace mit den Packages `client`, `server` und `shared` (`@keepit/schemas`). Es gibt ein zentrales Root-`pnpm-lock.yaml` — alte `package-lock.json`/`server/pnpm-lock.yaml` sind entfernt.

`.npmrc` setzt `node-linker=hoisted`, d.h. Prod-Dependencies liegen flach im Root-`node_modules` (npm-artig). Du siehst sie also nicht unter `server/node_modules` — das ist normal.

## Install / Lockfile

```bash
pnpm install                       # alles installieren, lockfile aktualisieren
pnpm install --frozen-lockfile     # CI/Railway: bricht, wenn lockfile nicht committet
```

Nach jeder Änderung an `package.json` (add/remove) das `pnpm-lock.yaml` mitcommitten — sonst bricht der Docker/Railway-Build.

## Packages hinzufügen / entfernen

Immer `--filter` angeben, sonst landet das Dependency im Root-`package.json`:

```bash
pnpm --filter client add react-query
pnpm --filter server add zod
pnpm --filter @keepit/schemas add zod
pnpm --filter client add -D vitest        # devDependency
```

```bash
pnpm --filter server remove bullmq
pnpm --filter client remove lodash
```

Workspace-intern referenzieren via `"@keepit/schemas": "workspace:*"` (bereits gesetzt).

## shared (`@keepit/schemas`) ändern

```bash
pnpm --filter @keepit/schemas build        # einmalig
pnpm --filter @keepit/schemas dev          # tsc --watch während dev
```

Client/Server müssen nach Schema-Änderung nicht neu installiert werden — der `workspace:*`-Symlink zeigt immer auf `shared/`. Nur `shared/dist` muss aktuell sein (bauen oder watch laufen lassen).

## Prisma Client generieren

```bash
pnpm --filter server exec prisma generate --schema prisma/schema
# oder: cd server && pnpm exec prisma generate
```

Läuft automatisch im `server build`-Skript (`prebuild`) und im Dockerfile.

## Client-Typen aus OpenAPI neu generieren

```bash
pnpm --filter client run generate:types    # openapi-typescript ../server/prisma/schema/openapi/openapi.yaml
```

Vorher `prisma generate` im Server ausführen, damit die `openapi.yaml` aktuell ist (Server-Build macht das automatisch vorweg).

## Build / Test / Lint über alle Workspaces

```bash
pnpm -r build
pnpm -r test
pnpm -r lint
```

`pnpm build` im Root baut `shared` zuerst, dann den Rest.

## Einzelnen Workspace testen / starten

```bash
pnpm --filter server test
pnpm --filter client test
pnpm --filter @keepit/schemas test

pnpm --filter client dev        # vite
pnpm --filter server dev        # nodemon + tsx
```

Oder parallel via `pnpm dev` (startet alle `dev`-Skripte parallel — shared muss dann separat im watch laufen oder vorher gebaut sein).

## Häufige Fallstricke

- **Lockfile nicht committet** → Railway/Docker bricht wegen `--frozen-lockfile`. Nach jeder `pnpm install`/`add`/`remove` das `pnpm-lock.yaml` committen.
- **shared ohne Build** → Client/Server importieren leeres/fehlendes `shared/dist`. Nach jeder Schema-Änderung `pnpm --filter @keepit/schemas build` ausführen.
- **`pnpm add` ohne `--filter`** → landet im Root-`package.json`. Fast immer falsch — immer `--filter <workspace>` angeben.
