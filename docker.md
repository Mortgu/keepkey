### Build the image and push
```bash
docker buildx build --platform linux/amd64,linux/arm64 --push --rm --tag=docker.io/oskarsammet/app:260623v1 .
```

```bash
docker swarm init --advertise [192.168...]
```

### Overlay network
```bash
docker network create --driver=overlay --attachable [NETWORK_NAME]
```

### Service
```bash
docker service create --name=[SERVICE_NAME] --network=[NETWORK_NAME] --replicas=2 -p 9000:8081 -t -d docker.io/oskarsammet/app:260623v1
```
-d = als deamon service

-t =

-p 9000:8081 (8081 Lokaler Container Port, 9000 Nach Außen)

```bash
docker service scale [SERVICE_NAME]=3
```

```bash
docker exec -it [CONTAINER_NAME] /bin/bash
```
## Betrieb: Migration, Seed, Start

Der Entrypoint wartet nur noch auf Postgres/Redis und führt dann das übergebene
Kommando aus. Default ist `node dist/server.js` — API und Worker in einem
Prozess. Migrationen und Seed laufen **nicht** mehr beim Containerstart.

### Migration (vor jedem Deployment)
```bash
docker run --rm --network=[NETWORK_NAME] --env-file .env docker.io/oskarsammet/app:[TAG] npx prisma migrate deploy --schema prisma/schema
```

### Seed (nur Erstinstallation oder bewusst)
```bash
docker run --rm --network=[NETWORK_NAME] --env-file .env docker.io/oskarsammet/app:[TAG] node dist-seed/prisma/seed.js
```

### Herunterfahren
`SHUTDOWN_TIMEOUT_MS` (Default 8 s) muss unter der Grace Period der Plattform
liegen, damit laufende Jobs (Dokumentkonvertierung über den Gotenberg-Sidecar)
nach SIGTERM noch fertig werden — z. B. `--stop-grace-period=120s` mit
`SHUTDOWN_TIMEOUT_MS=110000`.

## Railway

Ein Service, Dockerfile-Build, **kein** Custom Start Command (dann gilt
`ENTRYPOINT` + `CMD` des Images).

- Pre-Deploy Command: `npx prisma migrate deploy --schema prisma/schema`, mit Pre-Deploy Timeout (z. B. 300 s)
- `RAILWAY_DEPLOYMENT_DRAINING_SECONDS=120` (Railway-Default ist 0 → sofort SIGKILL)
- `SHUTDOWN_TIMEOUT_MS=110000`
- Erster Deploy auf leerer Datenbank: Pre-Deploy einmalig um `&& node dist-seed/prisma/seed.js` ergänzen (in `sh -c "..."`), danach wieder entfernen.

Achtung: Ein Custom Start Command ersetzt bei Railway den `ENTRYPOINT`. Wer
eins setzt, ruft das Skript explizit auf, z. B. `/app/docker-entrypoint.sh node dist/worker.js`.

### Healthcheck und Neustart

Von Hand in den Service-Settings gesetzt (Settings → Deploy). `railway.json` ist
bei Railway abgekündigt (wird ab 2026-12-01 nicht mehr gelesen); der Nachfolger
Infrastructure as Code (`.railway/railway.ts`) ist noch nicht eingeführt.

- Healthcheck Path: `/api/auth/ok` (better-auth, ohne Login, antwortet `{"ok":true}`)
- Restart Policy: `On Failure`, Max Retries `10`

Der Healthcheck läuft **nur beim Deploy**: Railway schaltet den Traffic erst auf
den neuen Deploy, wenn der Pfad 2xx liefert — ein kaputter Start geht so nicht
live. Danach prüft Railway nichts mehr; das übernimmt Uptime Kuma (unten).
Nach einer Trennung von API und Worker gilt der Healthcheck nur für den
API-Service — der Worker hat keinen HTTP-Port.

### Benachrichtigungen

Bis Uptime Kuma Mails verschickt, ist Railway die einzige Alarmquelle: in den
Account-Settings unter Notifications die E-Mails für abgestürzte und
fehlgeschlagene Deploys einschalten. Das deckt auch den Fall ab, dass Kuma
selbst (im selben Projekt) ausfällt.

## Gotenberg (Dokumentkonvertierung)

Die App rendert DOCX → PDF nicht selbst, sondern schickt die Datei per HTTP an
Gotenberg (`POST /forms/libreoffice/convert`, siehe `server/src/lib/docx-to-pdf.ts`).
Gotenberg läuft als eigener Service ohne öffentliche Domain und ist nur über
das private Netz des Projekts erreichbar. `GOTENBERG_URL` ist Pflicht —
ohne die Variable startet die App nicht.

### Einrichtung auf Railway

1. Im Projekt **Keepkey** → **Create** → **Docker Image** →
   `gotenberg/gotenberg:8.38.1` (exakte Version wie in `dev/docker-compose.yml`,
   kein schwebendes `:8`). Service-Name `gotenberg`.
2. Settings → Networking: **keine** Domain generieren. Der private Name ist
   damit `gotenberg.railway.internal`, Port `3000` (Gotenberg-Default).
3. Variables: `PORT=3000`. Gotenberg selbst ignoriert die Variable, aber
   Railways Healthcheck prüft den Port aus `PORT` — ohne sie schlägt er mit
   „service unavailable“ fehl, obwohl Gotenberg läuft.
4. Settings → Deploy: Healthcheck Path `/health`, Restart Policy `On Failure`,
   eine Replica.
5. Im Service `keepkey` die Variable setzen:
   `GOTENBERG_URL=http://${{gotenberg.RAILWAY_PRIVATE_DOMAIN}}:3000`
   (Referenz-Variable — folgt einer Umbenennung des Services automatisch).

### Umstellung von Produktion

Reihenfolge einhalten, sonst startet die App ohne `GOTENBERG_URL` nicht:

1. Gotenberg wie oben deployen, Status grün.
2. `GOTENBERG_URL` im Service `keepkey` setzen. Der Redeploy des aktuellen
   `main` ignoriert die Variable — harmlos.
3. Erst jetzt den Gotenberg-Stand nach `main` mergen.
4. In Produktion ein echtes Dokument (Angebot, Bestellung, Rechnung oder
   Bestätigung) erzeugen und prüfen, dass das PDF korrekt aussieht.
   Schlägt es fehl: im Log nach `gotenberg_unreachable` suchen (Netz/URL) bzw.
   die Logs des Gotenberg-Service ansehen (Dokument abgelehnt).
5. Kuma-Monitor für Gotenberg anlegen (unten).

## Monitoring (Uptime Kuma)

Uptime Kuma läuft als eigener Service im Railway-Projekt und prüft alle
Systeme laufend — auch die privaten über `*.railway.internal`. Die App selbst
hat dafür keinen Code. Benachrichtigungen per E-Mail (SMTP) sind noch nicht
eingerichtet; bis dahin ist Kuma nur eine Statusübersicht.

### 1. Service anlegen

1. Im Projekt **Keepkey** → **Create** → **Template** → „Uptime Kuma“ wählen und
   deployen. Das Template legt ein Volume für `/app/data` an (SQLite mit allen
   Monitoren und dem Login) — prüfen, dass es unter dem Service auftaucht, sonst
   ist nach jedem Neustart alles weg.
2. Unter Settings → Networking eine Railway-Domain generieren (Port `3001`).
3. **Sofort** die Domain öffnen und das Admin-Konto anlegen. Kuma vergibt es an
   den ersten Besucher — wer zuerst kommt, ist Admin.
4. In Kuma unter Settings → Security die Zwei-Faktor-Anmeldung einschalten.

### 2. Postgres-User für Kuma

Kuma bekommt einen eigenen User, der sich nur anmelden kann — nicht den der App.
Im Postgres-Service unter **Data** (Query-Konsole) oder per
`railway connect Postgres` ausführen, Passwort selbst erzeugen
(z. B. `openssl rand -base64 24`):

```sql
CREATE ROLE kuma LOGIN PASSWORD '<passwort>';
GRANT CONNECT ON DATABASE railway TO kuma;
```

Für `SELECT 1` braucht der User keine weiteren Rechte. Der Datenbankname steht
in der Variable `PGDATABASE` des Postgres-Services (Default `railway`).

### 3. Monitore

In Kuma jeweils **Add New Monitor**, Intervall 60 s, Retries 2 (vermeidet
Fehlalarme bei kurzen Aussetzern):

| Name | Monitor-Typ | Ziel |
|---|---|---|
| App | HTTP(s) | `https://keepkey-production-0f23.up.railway.app/api/auth/ok` |
| Postgres | PostgreSQL | `postgres://kuma:<passwort>@postgres.railway.internal:5432/railway`, Query `SELECT 1` |
| Redis | Redis | Wert von `REDIS_URL` aus dem Redis-Service, mit Host `redis.railway.internal` |
| NextCloud | HTTP(s) - Keyword | `<NEXTCLOUD_URL>/status.php`, Keyword `"maintenance":false` |
| Gotenberg | HTTP(s) | `http://gotenberg.railway.internal:3000/health` — sobald der Service läuft |

Die privaten Hostnamen entsprechen den Service-Namen in Railway (klein
geschrieben). Schlägt ein privater Monitor mit „ENOTFOUND“ oder Timeout fehl,
im Ziel-Service unter Settings → Networking den Private-Networking-Namen
nachsehen. Lehnt Postgres die Verbindung wegen SSL ab, `?sslmode=require` an die
URL hängen.

Bewusst ohne Monitor:

- **S3-Bucket**: von Railway verwaltet; ein unsignierter Request liefert nur 403.
- **Worker**: kein HTTP-Port; ein Absturz fällt unter die Railway-Benachrichtigungen.

## Optional: API und Worker getrennt

Erst sinnvoll, wenn die Dokumentgenerierung die API ausbremst (CPU, OOM) oder
unabhängig skaliert werden soll. Keine Codeänderung nötig:

- API-Service: Startkommando `node dist/api.js`
- Worker-Service: Startkommando `node dist/worker.js`, keine Domain, lange Grace Period
- Migration als Pre-Deploy auf **beiden** Services (Prisma sperrt parallele Läufe),
  weil die Services unabhängig voneinander deployen
- Übergang kurz halten: Während alter und neuer Worker parallel laufen, verhindert
  der `runToken` widersprüchliches Abschließen, aber nicht jede doppelte externe
  Wirkung bei Lock-Verlust/stalled Jobs.

Swarm-Beispiel:
```bash
docker service create --name=[APP]-worker --network=[NETWORK_NAME] --env-file .env -e SHUTDOWN_TIMEOUT_MS=110000 --stop-grace-period=120s --replicas=1 -d docker.io/oskarsammet/app:[TAG] node dist/worker.js
docker service create --name=[APP]-api --network=[NETWORK_NAME] --env-file .env --stop-grace-period=15s --replicas=2 -p 9000:3000 -d docker.io/oskarsammet/app:[TAG] node dist/api.js
```
