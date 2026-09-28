Ja. Ich würde die Trennung als kleine infrastrukturelle Umstellung planen, nicht als fachliches Refactoring. Datenmodell, Queue-Namen, Jobs und Handler bleiben zunächst unverändert.

## Zielbild

| Prozess | Verantwortlichkeiten | Abhängigkeiten |
|---|---|---|
| API | Express, Auth, REST, statische Client-Dateien, Queue-Produzent | Postgres, Redis, S3, optional Nextcloud |
| Worker | BullMQ-Verarbeitung, Dokument-Pipelines | Postgres, Redis, S3, optional Nextcloud |
| Migration | Prisma-Migrationen, optional initiales Seeding | Postgres |

Die Kommunikation bleibt:

```text
Client → API → Postgres Task + BullMQ Job → Worker → S3/Nextcloud
```

## Phase 1: Einstiegspunkte trennen

1. `server/src/app.ts` einführen:
   - Express-App erzeugen
   - Middleware, Auth, Router und statische Dateien registrieren
   - Keine Initialisierung, kein `listen()`, keine Signal-Handler

2. `server/src/api.ts` einführen:
   - Object Storage initialisieren
   - Nextcloud initialisieren
   - Express-App starten
   - Keinen Worker registrieren
   - HTTP-Server-Instanz für sauberes Herunterfahren behalten

3. `server/src/worker.ts` einführen:
   - Worker-Abhängigkeiten initialisieren
   - `registerTaskWorker()` aufrufen
   - Keinen Express-Server importieren oder starten

4. Den bisherigen [server.ts](/Users/oskar/Programming/keepit/server/src/server.ts:1) für eine Übergangsphase als kombinierten Fallback behalten oder durch einen deutlich benannten `combined.ts` ersetzen. Nach erfolgreichem Rollout kann er entfernt werden.

## Phase 2: Queue und Ressourcen sauber aufteilen

Momentan erzeugt `task-queue.ts` beim Import direkt eine Queue und verwendet dieselbe Redis-Verbindung wie der Worker. Ich würde daraus machen:

- `task-contract.ts`
  - `TaskJobData`
  - Queue-Name
  - gemeinsame Job-Optionen
- `task-queue.ts`
  - ausschließlich Producer-Queue für die API
- `task-worker.ts`
  - ausschließlich BullMQ-Worker
- getrennte Redis-Verbindungen für Producer und Worker

Das verhindert Import-Seiteneffekte und erlaubt unterschiedliche Redis-Einstellungen: Der API-Produzent soll zeitnah fehlschlagen, während der Worker dauerhaft reconnecten darf.

## Phase 3: Graceful Shutdown

API-Shutdown:

1. Keine neuen HTTP-Verbindungen mehr annehmen.
2. Laufende Requests beenden lassen.
3. Producer-Queue schließen.
4. Redis schließen.
5. Prisma trennen.
6. Logger flushen.

Worker-Shutdown:

1. Keine neuen Jobs annehmen.
2. Laufenden Job abschließen lassen.
3. BullMQ-Worker schließen.
4. Redis und Prisma schließen.
5. Logger flushen.

`process.exit()` sollte erst als Timeout-Fallback verwendet werden. Aktuell wird in [server.ts](/Users/oskar/Programming/keepit/server/src/server.ts:77) nur der Worker geschlossen.

## Phase 4: Startskripte

In `server/package.json`:

```json
{
  "scripts": {
    "dev:api": "nodemon --exec tsx src/api.ts",
    "dev:worker": "nodemon --exec tsx src/worker.ts",
    "start:api": "node dist/api.js",
    "start:worker": "node dist/worker.js"
  }
}
```

Für lokale Entwicklung können beide Prozesse über `concurrently` gestartet werden. Entscheidend ist, dass Produktion zwei getrennte Commands nutzt.

## Phase 5: Container- und Deployment-Anpassung

Der größte Stolperstein ist derzeit [docker-entrypoint.sh](/Users/oskar/Programming/keepit/docker-entrypoint.sh:1): Jeder gestartete Container führt Migrationen und Seeding aus. Mit API und Worker würde das parallel zweimal passieren.

Daher:

- Dasselbe Docker-Image für API, Worker und Migration verwenden.
- Migrationen in einen einmaligen `migrate`-Service verschieben.
- Seeding nicht automatisch bei jedem Produktionsstart ausführen.
- API startet mit `node dist/api.js`.
- Worker startet mit `node dist/worker.js`.

Das Compose-Zielbild:

```yaml
services:
  migrate:
    command: node_modules/.bin/prisma migrate deploy --schema server/prisma/schema
    restart: "no"

  api:
    command: node dist/api.js
    depends_on:
      migrate:
        condition: service_completed_successfully

  worker:
    command: node dist/worker.js
    depends_on:
      migrate:
        condition: service_completed_successfully
```

API und Worker verwenden dasselbe Image und dieselben Umgebungsvariablen, bekommen aber unterschiedliche Skalierung und Restart-Policies.

## Phase 6: Verifikation

Vor dem Rollout sollten folgende Tests existieren:

- Import von `app.ts` öffnet weder Port noch Redis-Verbindung.
- API-Start registriert keinen Worker.
- Worker-Start öffnet keinen HTTP-Port.
- Ein über die API erzeugter Job wird genau vom separaten Worker verarbeitet.
- `SIGTERM` während eines Jobs beendet diesen kontrolliert.
- Neustart des Workers verarbeitet wartende Jobs weiter.
- Mehrere Worker konkurrieren korrekt um denselben Job.
- Redis-Ausfall liefert bei neuen Generierungsaufträgen kontrolliert `503`.
- Bestehende 26 Servertests bleiben grün.

Zusätzlich würde ich `/health/live` und `/health/ready` ergänzen. Für den Worker reichen zunächst strukturierte Start-, Ready-, Job- und Shutdown-Logs.

## Rollout-Reihenfolge

1. Neue Entry-Points und Tests einführen, bisherigen kombinierten Start noch behalten.
2. Neues Image bauen.
3. Separaten Worker starten.
4. Prüfen, ob er Jobs verarbeitet.
5. API auf den workerlosen Entry-Point umstellen.
6. Kombinierten Entry-Point nach einer stabilen Release-Phase entfernen.

So besteht während der Umstellung kein Zeitraum ohne Job-Verarbeitung. Vorübergehend mehrere Worker sind für BullMQ unproblematisch.

Geschätzter Umfang: etwa **1–2 Entwicklungstage**, wenn wir die bestehende Infrastruktur beibehalten. Ich würde die Outbox/Reconciliation-Lösung bewusst als anschließenden Schritt behandeln, damit die Prozess-Trennung klein und gut überprüfbar bleibt.