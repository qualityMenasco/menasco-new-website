import { Children, isValidElement } from 'react';
import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '../../lib/utils';

const EASE = [0.22, 0.61, 0.36, 1] as const;

export interface ScrollRevealProps {
  children: ReactNode;
  id?: string;
  className?: string;
  /** Extra delay in seconds, for hand-sequencing a handful of adjacent reveals. */
  delay?: number;
}

/**
 * Wraps a homepage section in a one-time fade + slight rise + gentle scale
 * as it enters the viewport (via framer-motion's `whileInView`, which is
 * IntersectionObserver-backed). Renders a plain, unanimated div under
 * `prefers-reduced-motion`. Also the natural place to hang a section's
 * anchor `id` — pass `id` and the built-in `scroll-mt` keeps it clear of
 * the fixed header when scrolled to.
 */
export function ScrollReveal({ children, delay = 0, id, className }: ScrollRevealProps) {
  const reducedMotion = useReducedMotion();
  const rootClassName = cn('scroll-mt-24', className);

  if (reducedMotion) {
    return (
      <div id={id} className={rootClassName}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      id={id}
      className={rootClassName}
      initial={{ opacity: 0.88, y: 16, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.65, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Matches grid-placement utilities (with or without a responsive prefix) worth forwarding from a child onto its wrapping motion.div — see ScrollRevealGroup below. */
const GRID_ITEM_CLASS_PATTERN = /(?:^|\S*:)(?:col-span-|col-start-|col-end-|row-span-|row-start-|row-end-|self-|order-)\S+/g;

const groupContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const groupItemVariants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: EASE } },
};

export interface ScrollRevealGroupProps {
  children: ReactNode;
  className?: string;
  /**
   * Viewport intersection threshold before revealing. Defaults to 20% of the
   * container's own height — fine for a short row of cards, but mathematically
   * unreachable for long single-column lists (e.g. many items stacked on
   * mobile) where 20% of the total height exceeds the viewport itself. Pass
   * a smaller number or 'some' (any part visible) for long stacked lists.
   */
  amount?: number | 'some' | 'all';
}

/** Like ScrollReveal, but staggers each direct child in one-by-one — for a row of cards or list items. */
export function ScrollRevealGroup({ children, className, amount = 0.2 }: ScrollRevealGroupProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={groupContainerVariants}
    >
      {Children.map(children, (child) => {
        // Forward any grid-placement classes (col-span-2, lg:col-span-3, etc.)
        // from the child onto its wrapping motion.div — otherwise they have no
        // effect, since the actual grid item is this wrapper, not the child one
        // level down. Only these specific utilities are forwarded (not the
        // child's full className) so borders/padding/background never end up
        // applied twice.
        const rawClassName = isValidElement<{ className?: string }>(child) ? child.props.className : undefined;
        const gridItemClassName = rawClassName?.match(GRID_ITEM_CLASS_PATTERN)?.join(' ');
        return (
          <motion.div className={gridItemClassName} variants={groupItemVariants}>
            {child}
          </motion.div>
        );
      })}
    </motion.div>
  );
}
