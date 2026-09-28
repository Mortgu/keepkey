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
liegen, damit laufende Jobs (LibreOffice-Konvertierung) nach SIGTERM noch
fertig werden — z. B. `--stop-grace-period=120s` mit `SHUTDOWN_TIMEOUT_MS=110000`.

## Railway

Ein Service, Dockerfile-Build, **kein** Custom Start Command (dann gilt
`ENTRYPOINT` + `CMD` des Images).

- Pre-Deploy Command: `npx prisma migrate deploy --schema prisma/schema`, mit Pre-Deploy Timeout (z. B. 300 s)
- `RAILWAY_DEPLOYMENT_DRAINING_SECONDS=120` (Railway-Default ist 0 → sofort SIGKILL)
- `SHUTDOWN_TIMEOUT_MS=110000`
- Erster Deploy auf leerer Datenbank: Pre-Deploy einmalig um `&& node dist-seed/prisma/seed.js` ergänzen (in `sh -c "..."`), danach wieder entfernen.

Achtung: Ein Custom Start Command ersetzt bei Railway den `ENTRYPOINT`. Wer
eins setzt, ruft das Skript explizit auf, z. B. `/app/docker-entrypoint.sh node dist/worker.js`.

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
