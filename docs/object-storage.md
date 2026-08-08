# Object storage

Generated offer and order PDF/DOCX artifacts are stored in a private S3-compatible bucket. The server validates bucket access during startup and will not start with an invalid configuration.

## Configuration

| Variable | Description |
| --- | --- |
| `S3_ENDPOINT` | Endpoint used by the server for S3 operations |
| `S3_PUBLIC_ENDPOINT` | Browser-reachable endpoint used when signing download URLs; defaults to `S3_ENDPOINT` |
| `S3_REGION` | Signing region (`garage` locally; use the value supplied by the provider) |
| `S3_BUCKET` | Private bucket name |
| `S3_ACCESS_KEY_ID` | Bucket access key ID |
| `S3_SECRET_ACCESS_KEY` | Bucket secret access key |
| `S3_FORCE_PATH_STYLE` | Set to `true` for Garage and providers requiring path-style URLs |

Download URLs are always valid for five minutes. Upload URLs are valid for fifteen — the user is uploading over their own connection, not the server over its.

## CORS (required for replacing generated files)

Replacing a generated document sends the file from the browser **directly to S3** via a signed `PUT`. Without a CORS rule the browser blocks that request before it leaves the page, and the upload fails with a network error that never reaches the server.

The bucket needs a rule allowing `PUT` from the app's origin, and allowing the `Content-Type` header — the browser announces it in the preflight, so a rule without it fails at `OPTIONS`. [`dev/cors.json`](../dev/cors.json) is the working local configuration:

```bash
aws s3api put-bucket-cors --bucket keepit-dev \
  --cors-configuration file://dev/cors.json \
  --endpoint-url http://localhost:3900
```

Two rules of thumb, both learned the hard way:

**One rule per origin.** Garage joins every `AllowedOrigins` entry of a rule into a single `Access-Control-Allow-Origin: a, b`. That header is invalid — it must carry exactly one origin — so the browser compares it against its own origin, finds no match, and blocks the request **even though the preflight returned 200**. To allow a second origin, add a second rule, not a second entry.

**No trailing slash.** An origin is scheme + host + port and never ends in `/`. `http://localhost:5173/` does not match `Origin: http://localhost:5173`, and Garage answers the preflight with `403`.

Verify with the request the browser actually sends — this shows the status and the returned header side by side, which the network tab does not:

```bash
curl -s -D - -o /dev/null -X OPTIONS \
  "http://localhost:3900/keepit-dev/replaced/offers/test/probe.docx" \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: PUT" \
  -H "Access-Control-Request-Headers: content-type" \
  | grep -iE "^HTTP|access-control-allow-origin"
```

Expect `HTTP/1.1 200 OK` and exactly one origin in the header.

`S3_PUBLIC_ENDPOINT` must resolve from the browser — the same requirement downloads already have, but a misconfiguration now breaks writes as well as reads.

If the preflight is clean and the `PUT` still fails, the cause is usually not CORS at all: the AWS SDK adds a checksum over the *empty* body when signing, which every real upload then contradicts. See the `uploadSigningClient` comment in `server/src/lib/document-artifact-store.ts`.

Use one bucket per environment. Bucket credentials need read, write, list/head, and delete permissions. Delete is used only to clean up artifacts from failed, unpublished generation attempts. Published documents are retained.

## Local Garage

`dev/docker-compose.yml` starts Garage 2.3 with persistent metadata and data volumes. Garage creates the `keepit-dev` bucket and its development key idempotently on first startup.

Run `make docker-up`, then use `http://localhost:3900` as the browser-reachable S3 endpoint. The app uses `http://garage:3900` inside the Compose network.

Garage WebUI is available at `http://localhost:3909`. Its port is bound to localhost only, and it uses the development-only admin token configured in Compose. The Garage admin API remains private inside the Compose network.

## Railway Bucket

1. Add a Bucket resource to the Railway project.
2. Open the server service and add reference variables for the bucket endpoint, region, bucket name, access key ID, and secret access key.
3. Map those references to the `S3_*` variables listed above. Do not paste credentials into repository files.
4. Set `S3_PUBLIC_ENDPOINT` to the externally reachable S3 endpoint because browsers follow signed download redirects directly.
5. Set `S3_FORCE_PATH_STYLE` according to Railway's generated S3 connection details. Start with `true`; change it only if Railway requires virtual-hosted-style URLs.
6. Deploy the server. A successful startup logs `[object-storage] Bucket access verified.`; an invalid endpoint, bucket, or credential aborts startup.

To switch to Garage later, replace only the endpoint, region, bucket, credentials, and path-style variables. No database or application-code change is required.
