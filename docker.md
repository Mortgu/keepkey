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
## API und Worker getrennt (Swarm)

Ein Image, drei Rollen. Der Entrypoint wartet nur noch auf Postgres/Redis und
führt dann das übergebene Kommando aus (Default: `node dist/api.js`).
Migrationen und Seed laufen **nicht** mehr beim Containerstart.

### 1. Migration (vor jedem Deployment, einmalig)
```bash
docker run --rm --network=[NETWORK_NAME] --env-file .env docker.io/oskarsammet/app:[TAG] npx prisma migrate deploy --schema prisma/schema
```

### Seed (nur Erstinstallation oder bewusst)
```bash
docker run --rm --network=[NETWORK_NAME] --env-file .env docker.io/oskarsammet/app:[TAG] node dist-seed/prisma/seed.js
```

### 2. Worker
`SHUTDOWN_TIMEOUT_MS` muss unter `--stop-grace-period` liegen, damit laufende
Jobs (LibreOffice-Konvertierung) nach SIGTERM noch fertig werden.
```bash
docker service create --name=[APP]-worker --network=[NETWORK_NAME] --env-file .env -e SHUTDOWN_TIMEOUT_MS=110000 --stop-grace-period=120s --replicas=1 -d docker.io/oskarsammet/app:[TAG] node dist/worker.js
```

### 3. API
```bash
docker service create --name=[APP]-api --network=[NETWORK_NAME] --env-file .env --stop-grace-period=15s --replicas=2 -p 9000:3000 -d docker.io/oskarsammet/app:[TAG] node dist/api.js
```

### Rollout von der kombinierten Variante
1. Migration mit dem neuen Image ausführen.
2. Worker-Service starten, Logs auf `worker_ready` und verarbeitete Jobs prüfen.
3. Bestehenden Service auf das neue Image umstellen — ohne Kommando startet er
   jetzt nur noch die API. Wer noch einen Übergang braucht, startet ihn mit
   `node dist/server.js` (API + Worker in einem Prozess).
4. Den Übergang kurz halten: Während kombinierter Prozess und separater Worker
   parallel laufen, verhindert der `runToken` widersprüchliches Abschließen,
   aber nicht jede doppelte externe Wirkung bei Lock-Verlust/stalled Jobs.
5. `dist/server.js` nach einer stabilen Release-Phase entfernen.
