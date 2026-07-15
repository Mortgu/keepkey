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

Download URLs are always valid for five minutes.

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
