import { S3Client, HeadObjectCommand, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

/**
 * Server-only S3 access for the Newsroom backend. Credentials are never
 * passed explicitly — the SDK v3 default provider chain resolves them:
 * locally, from the developer's AWS CLI/SSO/profile credentials (whatever
 * `aws configure` or `AWS_PROFILE` already provides); in a deployed AWS
 * compute environment, from an attached IAM role. Nothing here ever sees or
 * logs an access key.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

let client: S3Client | null = null;

export function getS3Client(): S3Client {
  if (client) return client;
  client = new S3Client({ region: requireEnv('AWS_REGION') });
  return client;
}

export function getNewsroomBucket(): string {
  return requireEnv('NEWSROOM_S3_BUCKET');
}

/** Short-lived presigned PUT URL — the bucket stays private; nothing is ever made public-read. */
export async function createPresignedPutUrl(key: string, contentType: string, expiresInSeconds: number): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: getNewsroomBucket(),
    Key: key,
    ContentType: contentType,
  });
  return getSignedUrl(getS3Client(), command, { expiresIn: expiresInSeconds });
}

/** Short-lived presigned GET URL — for internal editor preview only (source PDF review, image thumbnails). Never persisted to RDS; computed fresh on every request, same as the PUT presigner. */
export async function createPresignedGetUrl(key: string, expiresInSeconds: number): Promise<string> {
  const command = new GetObjectCommand({ Bucket: getNewsroomBucket(), Key: key });
  return getSignedUrl(getS3Client(), command, { expiresIn: expiresInSeconds });
}

export interface S3ObjectHead {
  contentType: string | undefined;
  contentLength: number | undefined;
}

/** Returns null if the object doesn't exist (e.g. finalize called before the PUT actually landed) instead of throwing, so callers can turn that into a clean 409. */
export async function headObject(key: string): Promise<S3ObjectHead | null> {
  try {
    const result = await getS3Client().send(new HeadObjectCommand({ Bucket: getNewsroomBucket(), Key: key }));
    return { contentType: result.ContentType, contentLength: result.ContentLength };
  } catch (err) {
    const status = (err as { $metadata?: { httpStatusCode?: number } })?.$metadata?.httpStatusCode;
    const name = (err as { name?: string })?.name;
    if (status === 404 || name === 'NotFound' || name === 'NoSuchKey') return null;
    throw err;
  }
}

/**
 * Downloads a private object's full body server-side — used by PDF
 * processing, which must read the source PDF itself rather than ever
 * handing the browser a way to fetch it directly. The bucket stays private
 * for this entire round trip; nothing here generates a public or even a
 * presigned GET URL.
 */
export async function getObjectBuffer(key: string): Promise<Buffer> {
  const result = await getS3Client().send(new GetObjectCommand({ Bucket: getNewsroomBucket(), Key: key }));
  const body = result.Body;
  if (!body) throw new Error(`S3 object ${key} has no body`);
  const chunks: Uint8Array[] = [];
  // AWS SDK v3's Body is a Node Readable in the Node runtime (Vercel's
  // Node functions, not edge) — the web-stream/Blob branches other SDK
  // consumers handle don't apply here.
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks);
}

export interface ObjectWithContentType {
  body: Buffer;
  contentType: string | undefined;
}

/** Same as `getObjectBuffer` but also returns the object's real stored Content-Type — used by the public image proxy, which must forward an accurate Content-Type to the browser rather than guessing one from the file extension. */
export async function getObjectWithContentType(key: string): Promise<ObjectWithContentType> {
  const result = await getS3Client().send(new GetObjectCommand({ Bucket: getNewsroomBucket(), Key: key }));
  const body = result.Body;
  if (!body) throw new Error(`S3 object ${key} has no body`);
  const chunks: Uint8Array[] = [];
  for await (const chunk of body as AsyncIterable<Uint8Array>) {
    chunks.push(chunk);
  }
  return { body: Buffer.concat(chunks), contentType: result.ContentType };
}

/**
 * Permanently deletes every object under `prefix` — paginated
 * ListObjectsV2 (1000 keys per page) followed by a batched DeleteObjects
 * per page (S3's own 1000-key-per-call limit). Used by the Newsroom
 * article-delete flow with `prefix = articlePrefix(articleId)` (see
 * s3Keys.ts): a private, per-article boundary that can never reach a
 * shared/global object, so this is safe to call without also
 * cross-checking individual DB-tracked keys — anything genuinely under an
 * article's own prefix belongs to that article, including any object a
 * past finalize call left behind without a matching DB row.
 *
 * Throws (rather than silently ignoring) on any per-object delete error,
 * so a caller can tell a genuine partial failure apart from a clean
 * success — deliberately not swallowed, since silently treating a partial
 * S3 failure as success is exactly what would leave orphaned files behind
 * with nothing left to signal that they need cleanup.
 */
export async function deleteObjectsWithPrefix(prefix: string): Promise<number> {
  const client = getS3Client();
  const bucket = getNewsroomBucket();
  let deletedCount = 0;
  let continuationToken: string | undefined;

  do {
    const listResult = await client.send(
      new ListObjectsV2Command({ Bucket: bucket, Prefix: prefix, ContinuationToken: continuationToken }),
    );
    const keys = (listResult.Contents ?? []).map((object) => object.Key).filter((key): key is string => Boolean(key));

    if (keys.length > 0) {
      const deleteResult = await client.send(
        new DeleteObjectsCommand({ Bucket: bucket, Delete: { Objects: keys.map((Key) => ({ Key })), Quiet: true } }),
      );
      if (deleteResult.Errors && deleteResult.Errors.length > 0) {
        const detail = deleteResult.Errors.map((e) => `${e.Key}: ${e.Code} ${e.Message}`).join('; ');
        throw new Error(`Failed to delete ${deleteResult.Errors.length} object(s) under "${prefix}": ${detail}`);
      }
      deletedCount += keys.length;
    }

    continuationToken = listResult.IsTruncated ? listResult.NextContinuationToken : undefined;
  } while (continuationToken);

  return deletedCount;
}
