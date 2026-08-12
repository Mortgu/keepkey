import { createHash, randomUUID } from "crypto";
import {
    DeleteObjectCommand,
    GetBucketCorsCommand,
    GetObjectCommand,
    HeadBucketCommand,
    PutObjectCommand,
    S3Client,
    type S3ClientConfig,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import env from "./env.js";

export type StoredDocumentArtifact = {
    objectKey: string;
    size: number;
    sha256: string;
};

export type StoredDocumentArtifacts = {
    pdf: StoredDocumentArtifact;
    docx: StoredDocumentArtifact;
};

export type DocumentArtifactScope = "offers" | "orders";
const DOWNLOAD_URL_TTL_SECONDS = 5 * 60;

/**
 * Etwas großzügiger als beim Download: hier lädt der Nutzer eine Datei über
 * seine Leitung hoch, nicht der Server über seine.
 */
const UPLOAD_URL_TTL_SECONDS = 15 * 60;

const credentials = {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
};

function createClient(endpoint: string, options: Partial<S3ClientConfig> = {}): S3Client {
    return new S3Client({
        endpoint,
        region: env.S3_REGION,
        forcePathStyle: env.S3_FORCE_PATH_STYLE,
        credentials,
        ...options,
    });
}

const storageClient = createClient(env.S3_ENDPOINT);
const downloadClient = env.S3_PUBLIC_ENDPOINT && env.S3_PUBLIC_ENDPOINT !== env.S3_ENDPOINT
    ? createClient(env.S3_PUBLIC_ENDPOINT)
    : storageClient;

/**
 * Eigener Client, nur zum Signieren von Upload-URLs.
 *
 * `WHEN_REQUIRED` unterdrückt die automatische Prüfsumme. Seit SDK 3.729 ist
 * `WHEN_SUPPORTED` der Standard: das SDK berechnet die CRC32 dann schon beim
 * Signieren — zu einem Zeitpunkt, an dem es noch gar keinen Body gibt — und
 * nimmt die Prüfsumme von leerem Inhalt mit in die signierte Query. Der Upload
 * der echten Datei läuft anschließend genau dagegen und wird abgelehnt.
 *
 * Bewusst ein eigener Client und nicht die Option am `downloadClient`: sind
 * `S3_ENDPOINT` und `S3_PUBLIC_ENDPOINT` gleich (lokal der Normalfall), ist der
 * `downloadClient` dasselbe Objekt wie der `storageClient` — und dessen
 * serverseitige Uploads haben einen Body, dort ist die Prüfsumme ein echter
 * Integritätsgewinn.
 */
const uploadSigningClient = createClient(env.S3_PUBLIC_ENDPOINT ?? env.S3_ENDPOINT, {
    requestChecksumCalculation: "WHEN_REQUIRED",
});

/**
 * Warum der Browser den Endpunkt nicht erreichen kann, unter dem signiert wird.
 *
 * `loopback` und `private_network` sind die beiden Fälle, die sich allein am
 * Endpunkt erkennen lassen: Ein Ersetzen legt die Datei direkt aus dem Browser
 * ab, ein interner Host läuft dort zwangsläufig ins Leere. Die dritte Hürde,
 * die fehlende CORS-Regel, prüft {@link bucketAllowsBrowserUploads}.
 */
export type BrowserEndpointIssue = "loopback" | "private_network";

const PRIVATE_HOST_SUFFIXES = [".internal", ".local"];
const LOOPBACK_HOSTS = ["localhost", "127.0.0.1", "::1", "[::1]"];

/**
 * Prüft den Endpunkt, gegen den Upload-URLs signiert werden, auf offensichtliche
 * Unerreichbarkeit aus dem Browser. In der Entwicklung ist ein Loopback-Host der
 * Normalfall und daher in Ordnung — dort läuft der Browser auf derselben Maschine.
 */
export function browserEndpointIssue(): BrowserEndpointIssue | null {
    const { hostname } = new URL(env.S3_PUBLIC_ENDPOINT ?? env.S3_ENDPOINT);

    if (PRIVATE_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
        return "private_network";
    }

    if (env.NODE_ENV === "production" && LOOPBACK_HOSTS.includes(hostname)) {
        return "loopback";
    }

    return null;
}

/**
 * Ergebnis der CORS-Prüfung am Bucket.
 *
 * `unknown` ist bewusst kein Fehler: Manche Anbieter geben die
 * CORS-Konfiguration nicht heraus. Wer sie nicht lesen kann, weiß nichts über
 * sie — und Unwissen darf die Funktion nicht abschalten.
 */
export type BucketCorsState = "allowed" | "missing" | "unknown";

/**
 * Prüft, ob eine CORS-Regel des Buckets ein `PUT` von der App-Origin erlaubt.
 *
 * Ohne diese Regel bricht der Browser den Direkt-Upload ab, obwohl der Server
 * alles richtig signiert hat — der `PUT` läuft sogar durch, nur darf der Client
 * die Antwort nicht lesen und den Upload deshalb nie bestätigen.
 */
export async function bucketAllowsBrowserUploads(): Promise<BucketCorsState> {
    try {
        const { CORSRules } = await storageClient.send(new GetBucketCorsCommand({
            Bucket: env.S3_BUCKET,
        }));

        const allowed = (CORSRules ?? []).some((rule) =>
            (rule.AllowedMethods ?? []).some((method) => method.toUpperCase() === "PUT")
            && (rule.AllowedOrigins ?? []).some(allowsAppOrigin));

        return allowed ? "allowed" : "missing";
    } catch (error) {
        // Nur das ausdrückliche „es gibt keine Konfiguration" ist eine Aussage;
        // alles andere (NotImplemented, AccessDenied, Netzwerk) ist keine.
        return errorName(error) === "NoSuchCORSConfiguration" ? "missing" : "unknown";
    }
}

function errorName(error: unknown): string | undefined {
    return error instanceof Error ? error.name : undefined;
}

/** Origins, unter denen die App im Browser läuft. */
function appOrigins(): Array<string> {
    return env.CORS_ORIGIN.split(",").map((origin) => origin.trim()).filter(Boolean);
}

/**
 * S3-CORS erlaubt genau ein `*` als Platzhalter je Origin-Eintrag, etwa
 * `https://*.example.com`. Ein alleinstehendes `*` erlaubt alles.
 */
function allowsAppOrigin(allowedOrigin: string): boolean {
    if (allowedOrigin === "*") return true;

    const [prefix, suffix] = allowedOrigin.split("*");

    return appOrigins().some((origin) => (
        suffix === undefined
            ? origin === allowedOrigin
            : origin.startsWith(prefix!) && origin.endsWith(suffix) && origin.length >= prefix!.length + suffix.length
    ));
}

async function settleOperations(operations: Promise<unknown>[]): Promise<void> {
    const results = await Promise.allSettled(operations);
    const errors = results
        .filter((result): result is PromiseRejectedResult => result.status === "rejected")
        .map((result) => result.reason);

    if (errors.length > 0) {
        throw new AggregateError(errors, "One or more document artifact operations failed.");
    }
}

export async function storeDocumentArtifacts(
    scope: DocumentArtifactScope,
    documentId: string,
    docxBuffer: Buffer,
    pdfBuffer: Buffer,
    generationId: string = randomUUID(),
): Promise<StoredDocumentArtifacts> {
    const prefix = `generated/${scope}/${documentId}/${generationId}`;
    const docx = artifact(`${prefix}.docx`, docxBuffer);
    const pdf = artifact(`${prefix}.pdf`, pdfBuffer);

    try {
        await settleOperations([
            putArtifact(docx, docxBuffer, "application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
            putArtifact(pdf, pdfBuffer, "application/pdf"),
        ]);
    } catch (error) {
        try {
            await removeDocumentArtifacts({ docx, pdf });
        } catch (cleanupError) {
            throw new AggregateError(
                [error, cleanupError],
                "Publishing document artifacts failed and cleanup was incomplete.",
            );
        }
        throw error;
    }

    return { pdf, docx };
}

export async function removeDocumentArtifacts(files: StoredDocumentArtifacts): Promise<void> {
    await settleOperations([
        deleteArtifact(files.docx.objectKey),
        deleteArtifact(files.pdf.objectKey),
    ]);
}

export async function getDocumentArtifact(objectKey: string): Promise<Buffer> {
    const response = await storageClient.send(new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: objectKey,
    }));

    if (!response.Body) {
        throw new Error(`Object ${objectKey} has no body.`);
    }

    return Buffer.from(await response.Body.transformToByteArray());
}

export async function getDocumentDownloadUrl(objectKey: string, downloadName: string, contentType: string): Promise<string> {
    const safeName = downloadName.replace(/["\\\r\n]/g, "_");

    return getSignedUrl(downloadClient, new GetObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: objectKey,
        ResponseContentType: contentType,
        ResponseContentDisposition: `attachment; filename="${safeName}"`,
    }), { expiresIn: DOWNLOAD_URL_TTL_SECONDS });
}

/**
 * Signierte URL, unter der der Browser eine Datei direkt nach S3 legen darf.
 *
 * Signiert wird gegen `S3_PUBLIC_ENDPOINT` — nur der ist aus dem Browser
 * erreichbar.
 *
 * `contentType` ist **nicht** Teil der Signatur (`SignedHeaders=host`): er legt
 * nur fest, als was das Objekt abgelegt wird, sofern der Browser denselben
 * Header schickt. Erzwungen wird damit nichts — und die Größe kann eine
 * signierte PUT-URL ohnehin nicht begrenzen. Beides prüft erst der
 * Bestätigungsschritt, der das Objekt lädt und Größe wie Prüfsumme bestimmt.
 */
export async function getDocumentUploadUrl(objectKey: string, contentType: string): Promise<string> {
    return getSignedUrl(uploadSigningClient, new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: objectKey,
        ContentType: contentType,
    }), { expiresIn: UPLOAD_URL_TTL_SECONDS });
}

/** Entfernt ein einzelnes Objekt — etwa einen abgebrochenen oder zu großen Upload. */
export async function removeDocumentArtifact(objectKey: string): Promise<void> {
    await deleteArtifact(objectKey);
}

export async function isS3Available(): Promise<boolean> {
    try {
        await storageClient.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
        return true;
    } catch {
        return false;
    }
}

export async function initDocumentArtifactStore(): Promise<void> {
    await storageClient.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
}

function artifact(objectKey: string, content: Buffer): StoredDocumentArtifact {
    return {
        objectKey,
        size: content.length,
        sha256: createHash("sha256").update(content).digest("hex"),
    };
}

async function putArtifact(
    stored: StoredDocumentArtifact,
    content: Buffer,
    contentType: string,
): Promise<void> {
    await storageClient.send(new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: stored.objectKey,
        Body: content,
        ContentLength: stored.size,
        ContentType: contentType,
        Metadata: { sha256: stored.sha256 },
    }));
}

async function deleteArtifact(objectKey: string): Promise<void> {
    await storageClient.send(new DeleteObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: objectKey,
    }));
}