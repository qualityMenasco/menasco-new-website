import { describe, it, expect } from 'vitest';
import { deriveOpensDisplay, deriveClosesDisplay } from './publicationWindow';
import { formatUaeDisplay } from './uaeTime';

const SCHEDULED = '2026-05-01T06:00:00.000Z';
const PUBLISHED = '2026-04-10T09:30:00.000Z';
const UNPUBLISH_SCHEDULED = '2026-06-01T00:00:00.000Z';

describe('deriveOpensDisplay', () => {
  it('shows the scheduled publish date when a future opening is scheduled (Draft, pending)', () => {
    const result = deriveOpensDisplay({ scheduledPublishAt: SCHEDULED, publishedAt: null, scheduledUnpublishAt: null });
    expect(result).toBe(formatUaeDisplay(SCHEDULED));
  });

  it('shows the actual published date when manually published with no scheduled opening', () => {
    const result = deriveOpensDisplay({ scheduledPublishAt: null, publishedAt: PUBLISHED, scheduledUnpublishAt: null });
    expect(result).toBe(formatUaeDisplay(PUBLISHED));
  });

  it('prefers the pending scheduled date over a published date if both were somehow present', () => {
    const result = deriveOpensDisplay({ scheduledPublishAt: SCHEDULED, publishedAt: PUBLISHED, scheduledUnpublishAt: null });
    expect(result).toBe(formatUaeDisplay(SCHEDULED));
  });

  it('shows "—" when no opening information exists at all', () => {
    const result = deriveOpensDisplay({ scheduledPublishAt: null, publishedAt: null, scheduledUnpublishAt: null });
    expect(result).toBe('—');
  });
});

describe('deriveClosesDisplay', () => {
  it('shows the scheduled unpublish date when a closing date exists', () => {
    const result = deriveClosesDisplay({ scheduledPublishAt: null, publishedAt: PUBLISHED, scheduledUnpublishAt: UNPUBLISH_SCHEDULED });
    expect(result).toBe(formatUaeDisplay(UNPUBLISH_SCHEDULED));
  });

  it('shows "—" when there is no closing date', () => {
    const result = deriveClosesDisplay({ scheduledPublishAt: null, publishedAt: PUBLISHED, scheduledUnpublishAt: null });
    expect(result).toBe('—');
  });

  it('shows "—" again once the scheduling worker (or a manual unpublish) has already closed the article — it clears scheduled_unpublish_at itself, so there is no historical close date to keep showing', () => {
    // Mirrors the exact post-close row shape: status back to Draft, published_at and
    // scheduled_unpublish_at both cleared by runScheduledPublishingWorker/unpublishArticle.
    const result = deriveClosesDisplay({ scheduledPublishAt: null, publishedAt: null, scheduledUnpublishAt: null });
    expect(result).toBe('—');
  });
});
