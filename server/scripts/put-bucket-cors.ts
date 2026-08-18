import {
    GetBucketCorsCommand,
    PutBucketCorsCommand,
    S3Client,
    type CORSRule,
} from "@aws-sdk/client-s3";
import env from "../src/lib/env.js";

/**
 * Setzt die CORS-Regel, ohne die der Browser keine Ersatzdatei in den Bucket
 * legen kann.
 *
 * Warum als Script und nicht als abgetippter `aws s3api`-Befehl:
 *
 * - Endpunkt, Bucket, Region und Origin stammen aus derselben Env wie der
 *   Server. Nichts wird abgetippt, und mit `railway run` gelten automatisch die
 *   Werte der jeweiligen Umgebung.
 * - `PutBucketCors` ersetzt die **gesamte** Konfiguration. Dieses Script liest
 *   deshalb zuerst die bestehenden Regeln und lässt fremde stehen — der rohe
 *   CLI-Befehl würde sie wortlos löschen.
 *
 * Aufruf: `npm --prefix server run cors:apply [-- --dry-run]`
 */

/**
 * Was der Direkt-Upload mindestens braucht. Weitere Methoden einer bereits
 * vorhandenen Regel bleiben erhalten — dieses Script ergänzt, es verengt nicht.
 */
const REQUIRED_METHODS = ["GET", "HEAD", "PUT", "POST"];

/**
 * Der Download geht als `<a download>` an unsere eigene API, die mit 302 auf die
 * signierte Bucket-URL umleitet. Ein Redirect über eine Origin-Grenze setzt das
 * "tainted origin"-Flag: Der Browser schickt danach `Origin: null` statt der
 * App-Origin. Ohne diesen Eintrag passt keine Regel, der Bucket antwortet ohne
 * `Access-Control-Allow-Origin`, und Firefox verwirft die 200er-Antwort.
 *
 * Das Objekt bleibt privat — lesbar nur mit einer signierten URL, die fünf
 * Minuten gilt.
 */
const REDIRECT_ORIGIN = "null";

/** Header, die der Browser nach dem Download lesen können muss. */
const REQUIRED_EXPOSED = ["ETag", "Content-Disposition", "Content-Length", "Content-Type"];

const dryRun = process.argv.includes("--dry-run");

const client = new S3Client({
    endpoint: env.S3_ENDPOINT,
    region: env.S3_REGION,
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    credentials: {
        accessKeyId: env.S3_ACCESS_KEY_ID,
        secretAccessKey: env.S3_SECRET_ACCESS_KEY,
    },
});

/** Origins, unter denen die App im Browser läuft. */
const appOrigins = env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);

const distinct = (values: Array<string>) => [...new Set(values)];

/**
 * Führt die vorhandenen Regeln unserer Origins mit dem zusammen, was der Upload
 * braucht. Bestehende Methoden und Header bleiben erhalten: Eine Umgebung, die
 * dem Browser bewusst mehr erlaubt, soll das nach diesem Lauf immer noch tun.
 */
function managedRule(existing: Array<CORSRule>): CORSRule {
    const mine = existing.filter(isManaged);

    return {
        AllowedOrigins: distinct([
            ...mine.flatMap((rule) => rule.AllowedOrigins ?? []),
            ...appOrigins,
            REDIRECT_ORIGIN,
        ]),
        AllowedMethods: distinct([...mine.flatMap((rule) => rule.AllowedMethods ?? []), ...REQUIRED_METHODS]),
        // Der Upload schickt den Content-Type mit, mit dem die URL signiert wurde.
        AllowedHeaders: distinct([...mine.flatMap((rule) => rule.AllowedHeaders ?? []), "*"]),
        ExposeHeaders: distinct([...mine.flatMap((rule) => rule.ExposeHeaders ?? []), ...REQUIRED_EXPOSED]),
        MaxAgeSeconds: mine.find((rule) => rule.MaxAgeSeconds !== undefined)?.MaxAgeSeconds ?? 3000,
    };
}

async function currentRules(): Promise<Array<CORSRule>> {
    try {
        const { CORSRules } = await client.send(new GetBucketCorsCommand({ Bucket: env.S3_BUCKET }));
        return CORSRules ?? [];
    } catch (error) {
        if (error instanceof Error && error.name === "NoSuchCORSConfiguration") {
            return [];
        }
        throw error;
    }
}

/** true, wenn die Regel eine unserer Origins bedient — die ersetzen wir. */
function isManaged(rule: CORSRule): boolean {
    return (rule.AllowedOrigins ?? []).some((origin) => appOrigins.includes(origin));
}

async function main() {
    if (appOrigins.length === 0) {
        throw new Error("CORS_ORIGIN ist leer — ohne Origin gibt es keine Regel zu setzen.");
    }

    const existing = await currentRules();
    const foreign = existing.filter((rule) => !isManaged(rule));
    const rules = [...foreign, managedRule(existing)];

    console.log(`Bucket   : ${env.S3_BUCKET} @ ${env.S3_ENDPOINT} (${env.S3_REGION})`);
    console.log(`Origins  : ${appOrigins.join(", ")}`);
    console.log(`Bestehend: ${existing.length} Regel(n), davon ${foreign.length} fremd (bleiben unverändert)`);
    console.log(JSON.stringify(rules, null, 2));

    if (dryRun) {
        console.log("\n--dry-run: nichts geschrieben.");
        return;
    }

    await client.send(new PutBucketCorsCommand({
        Bucket: env.S3_BUCKET,
        CORSConfiguration: { CORSRules: rules },
    }));

    const written = await currentRules();
    console.log(`\nGeschrieben. Der Bucket meldet jetzt ${written.length} Regel(n).`);
}

await main();
process.exit(0);
