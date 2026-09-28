import type { VercelRequest, VercelResponse } from '@vercel/node';
import { HttpError, requireMethod, withErrorHandling } from '../../../_lib/http';
import { getPublicImageS3Key } from '../../../_lib/newsroom/publicArticles';
import { getObjectWithContentType } from '../../../_lib/s3';
import { isValidUuid } from '../../../_lib/validation';

/**
 * GET /api/newsroom/public/images/:imageId — the Phase 4 public image
 * delivery mechanism (chosen: option A, an authenticated-at-the-query-level
 * backend proxy — see Phase 4 report for why CloudFront/a second public
 * bucket was ruled out: both require new AWS infrastructure this session
 * cannot provision, and the spec calls for stopping and reporting rather
 * than inventing that in code).
 *
 * The private `menasco-newsroom-prod` bucket is never made public and no
 * presigned URL is ever handed to a public visitor — this endpoint reads
 * the object server-side (`getObjectWithContentType`, same mechanism the
 * admin preview endpoints and PDF processing already use) and streams the
 * bytes back with the real stored Content-Type.
 *
 * `getPublicImageS3Key` is the actual security boundary: its query joins
 * through `news_articles` and requires `status = 'published'`, so an image
 * belonging to a draft/ready/unpublished article 404s here exactly like a
 * nonexistent image id — this proxy can never be used to peek at
 * unpublished content by guessing an image id.
 *
 * Cache-Control is a short 60 seconds with no stale-while-revalidate — not
 * `immutable`/a year, and not the longer max-age this endpoint used before
 * a pre-launch cache-withdrawal hardening pass: an editor can replace an
 * image at the same position after publish (a new finalize call upserts the
 * row's `s3_key` in place) and, more importantly, `getPublicImageS3Key`'s
 * `status = 'published'` join is the actual security boundary for this
 * image — an unpublish must stop this URL from serving within a bounded
 * short window, not up to a day later while a stale cached copy keeps being
 * served during background revalidation. Deliberately `max-age` (not
 * `s-maxage`): this route is proxied verbatim by vercel.json's
 * `/api/newsroom/public/:path*` rewrite straight to this same Lambda
 * response, the identical mechanism already proven (for the sibling
 * articles endpoints) to have Vercel's edge honor whatever Cache-Control
 * this handler sets — so `max-age` here bounds the browser's own private
 * cache the same way it bounds the CDN, since `<img>` tags hold this URL
 * directly.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  await withErrorHandling(res, async () => {
    requireMethod(req, 'GET');

    const imageId = req.query.imageId;
    if (typeof imageId !== 'string' || !isValidUuid(imageId)) throw new HttpError(400, 'Invalid image id');

    const s3Key = await getPublicImageS3Key(imageId);
    if (!s3Key) throw new HttpError(404, 'Image not found');

    const { body, contentType } = await getObjectWithContentType(s3Key);

    res.status(200);
    res.setHeader('Content-Type', contentType ?? 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=60, must-revalidate');
    res.send(body);
  });
}
