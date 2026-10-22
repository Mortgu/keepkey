---
status: proposed
---

# API and worker split into separate Railway services

The app runs as one Railway service, `node dist/server.js`, with API routes and the BullMQ worker in the same process — though `start:api`/`start:worker` scripts and an overridable Dockerfile `CMD` already exist for running them apart with no code change. Once the Gotenberg sidecar (ADR 0002) moves the CPU-heavy conversion work out of this process, the original motivation for splitting — a hung conversion contending with request handling — is mostly already resolved; the split's remaining value is restart and scaling isolation: a bug in task processing shouldn't be able to take down API request handling, or vice versa. We're standing up two Railway services from the same image: `api` (public domain, `node dist/api.js`) and `worker` (no public domain, `node dist/worker.js`), started via `/app/docker-entrypoint.sh node dist/api.js` / `.../worker.js` as Railway custom start commands, with `prisma migrate deploy` as a pre-deploy command on both (Prisma locks parallel migration runs, so both need it once they deploy separately).

## Considered Options

- Let `api` and `worker` auto-deploy independently, the normal Railway default for separate services — rejected: both read and write the same `Task` rows, and an uncoordinated deploy risks running mismatched code versions against them. The two services are pinned to deploy together from the same commit instead; independent *scaling* (replica count) is kept, independent *deploys* are deliberately given up.

## Consequences

- During a coordinated deploy, an old and new `worker` instance can briefly run in parallel. The existing `runToken` column on `Task` prevents contradictory completions but not every duplicate external side effect from a stalled or lock-lost job — an accepted, pre-existing limitation of this topology, not hardened further here.
