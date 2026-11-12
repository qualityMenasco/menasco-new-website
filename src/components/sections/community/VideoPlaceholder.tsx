import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '../../../lib/utils';

/**
 * Stand-in for a video that hasn't been supplied yet — a dark frame with a
 * play mark and a "video coming soon" label, sized by the caller (e.g.
 * aspect-[9/16] for portrait). Shared by both trees; swap for the real
 * player once the file exists.
 */
export function VideoPlaceholder({ className }: { className?: string }) {
  const { t } = useTranslation('about');
  return (
    <div
      role="img"
      aria-label={t('community.video.comingSoon')}
      className={cn('flex flex-col items-center justify-center gap-4 rounded-md bg-gradient-to-b from-charcoal to-ink text-warmwhite', className)}
    >
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-white/25 bg-white/10">
        <Play size={22} aria-hidden="true" className="translate-x-0.5" />
      </span>
      <span className="text-caption font-semibold uppercase tracking-wider text-gray-300">{t('community.video.comingSoon')}</span>
    </div>
  );
}
