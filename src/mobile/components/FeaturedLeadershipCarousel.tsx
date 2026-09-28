import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { MobileFeaturedLeaderCard } from './MobileFeaturedLeaderCard';
import { LeadershipProfileModal } from './LeadershipProfileModal';
import { cn } from '../lib/utils';
import type { LeadershipProfile } from '../../data/leadership';

export interface FeaturedLeadershipCarouselProps {
  /** Leaders in display order — the carousel loops through them exactly as given. */
  leaders: LeadershipProfile[];
}

const AUTOPLAY_INTERVAL_MS = 4000;
const RESUME_AFTER_INTERACTION_MS = 5000;

/**
 * Mobile-only featured-leadership carousel: Helmi and Bahaa in a snap-scroll
 * row that auto-advances between them and loops, while staying fully
 * swipeable. Pauses for prefers-reduced-motion, background tabs, the
 * section leaving the viewport, and while the user is touching/focusing it.
 */
export function FeaturedLeadershipCarousel({ leaders }: FeaturedLeadershipCarouselProps) {
  const { t } = useTranslation('about');
  const reducedMotion = useReducedMotion();
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const sectionRef = useRef<HTMLDivElement>(null);
  const resumeTimeoutRef = useRef<number | undefined>(undefined);

  const [activeIndex, setActiveIndex] = useState(0);
  const [modalProfile, setModalProfile] = useState<LeadershipProfile | null>(null);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isSectionVisible, setIsSectionVisible] = useState(true);
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const onVisibilityChange = () => setIsTabVisible(document.visibilityState === 'visible');
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () => document.removeEventListener('visibilitychange', onVisibilityChange);
  }, []);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setIsSectionVisible(entry.isIntersecting), {
      threshold: 0.3,
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const scrollToIndex = (index: number, behavior: ScrollBehavior) => {
    cardRefs.current[index]?.scrollIntoView({ behavior, inline: 'start', block: 'nearest' });
  };

  useEffect(() => {
    if (reducedMotion || isInteracting || !isSectionVisible || !isTabVisible || leaders.length < 2) return;
    const id = window.setInterval(() => {
      setActiveIndex((current) => {
        const next = (current + 1) % leaders.length;
        scrollToIndex(next, 'smooth');
        return next;
      });
    }, AUTOPLAY_INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reducedMotion, isInteracting, isSectionVisible, isTabVisible, leaders.length]);

  const pauseThenResume = () => {
    setIsInteracting(true);
    if (resumeTimeoutRef.current) window.clearTimeout(resumeTimeoutRef.current);
    resumeTimeoutRef.current = window.setTimeout(() => setIsInteracting(false), RESUME_AFTER_INTERACTION_MS);
  };

  useEffect(() => () => window.clearTimeout(resumeTimeoutRef.current), []);

  // Keeps the active dot (and the autoplay sequence) in sync when the user
  // swipes manually — finds whichever card sits nearest the track's own
  // left edge rather than assuming a fixed card width.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let frame: number | null = null;
    const onScroll = () => {
      if (frame !== null) return;
      frame = requestAnimationFrame(() => {
        frame = null;
        const trackLeft = track.getBoundingClientRect().left;
        let closestIndex = 0;
        let closestDistance = Infinity;
        cardRefs.current.forEach((card, index) => {
          if (!card) return;
          const distance = Math.abs(card.getBoundingClientRect().left - trackLeft);
          if (distance < closestDistance) {
            closestDistance = distance;
            closestIndex = index;
          }
        });
        setActiveIndex(closestIndex);
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  const handleDotClick = (index: number) => {
    pauseThenResume();
    setActiveIndex(index);
    scrollToIndex(index, reducedMotion ? 'auto' : 'smooth');
  };

  return (
    <div ref={sectionRef}>
      <div
        ref={trackRef}
        role="region"
        aria-label={t('team.featuredLeadershipRegion')}
        tabIndex={0}
        onTouchStart={pauseThenResume}
        onPointerDown={pauseThenResume}
        onFocus={() => setIsInteracting(true)}
        onBlur={pauseThenResume}
        className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1"
      >
        {leaders.map((leader, index) => (
          <div
            key={leader.slug}
            ref={(node) => {
              cardRefs.current[index] = node;
            }}
            className="w-[86%] shrink-0 snap-start"
          >
            <MobileFeaturedLeaderCard profile={leader} onReadFullProfile={() => setModalProfile(leader)} />
          </div>
        ))}
      </div>

      {leaders.length > 1 && (
        <div className="mt-3 flex justify-center gap-2">
          {leaders.map((leader, index) => (
            <button
              key={leader.slug}
              type="button"
              aria-label={t('team.showLeader', { name: leader.fullName, defaultValue: `Show ${leader.fullName}` })}
              aria-current={activeIndex === index}
              onClick={() => handleDotClick(index)}
              className={cn(
                'h-1.5 rounded-full transition-all duration-300',
                activeIndex === index ? 'w-5 bg-brand-600' : 'w-1.5 bg-gray-300',
              )}
            />
          ))}
        </div>
      )}

      {modalProfile && <LeadershipProfileModal profile={modalProfile} onClose={() => setModalProfile(null)} />}
    </div>
  );
}
