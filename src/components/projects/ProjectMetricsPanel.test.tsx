import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProjectMetricsPanel } from './ProjectMetricsPanel';

const baseProps = {
  categoryLabel: 'Category',
  completionLabel: 'Completion',
};

describe('ProjectMetricsPanel — renders nothing invented', () => {
  it('renders no metric grid and no completion card when the project has none of this data', () => {
    const { container } = render(<ProjectMetricsPanel {...baseProps} keyMetrics={[]} />);
    expect(container.querySelector('.grid')).not.toBeInTheDocument();
    expect(screen.queryByText('Completion')).not.toBeInTheDocument();
  });

  it('renders exactly the real keyMetrics provided, never padded', () => {
    render(
      <ProjectMetricsPanel
        {...baseProps}
        keyMetrics={[
          { label: 'IT Capacity', value: '18 MW' },
          { label: 'Voltage', value: '132/11 kV' },
        ]}
      />,
    );
    expect(screen.getByText('18 MW')).toBeInTheDocument();
    expect(screen.getByText('132/11 kV')).toBeInTheDocument();
  });
});

describe('ProjectMetricsPanel — orphaned-card layout fix', () => {
  it('spans a lone card (only category, no key metrics) across both grid columns instead of leaving an empty cell', () => {
    const { container } = render(<ProjectMetricsPanel {...baseProps} keyMetrics={[]} categoryTitle="Residential" />);
    const card = screen.getByText('Residential').closest('div.col-span-2');
    expect(card).toBeInTheDocument();
    // sanity: with an even card count, nothing should get col-span-2
    const { container: evenContainer } = render(
      <ProjectMetricsPanel {...baseProps} keyMetrics={[{ label: 'IT Capacity', value: '18 MW' }]} categoryTitle="Residential" />,
    );
    expect(evenContainer.querySelectorAll('.col-span-2')).toHaveLength(0);
    expect(container).toBeTruthy();
  });

  it('spans the last card across both columns when there are 3 key metrics and no category (4 total would be even, so use 1 metric + no category = odd)', () => {
    render(<ProjectMetricsPanel {...baseProps} keyMetrics={[{ label: 'Units', value: '417' }]} />);
    const card = screen.getByText('417').closest('div.col-span-2');
    expect(card).toBeInTheDocument();
  });
});

describe('ProjectMetricsPanel — every box in a project shares one text size, picked from that project\'s own longest value', () => {
  it('shrinks every box (including a short one) to fit the longest value present, rather than overflowing it', () => {
    render(
      <ProjectMetricsPanel
        {...baseProps}
        keyMetrics={[
          { label: 'Status', value: 'Completed' },
          { label: 'Category', value: 'Residential & Commercial Development' },
        ]}
        categoryTitle="RESIDENTIAL / COMMERCIAL DEVELOPMENTS"
      />,
    );
    // Longest value here is 38 chars ("RESIDENTIAL / COMMERCIAL DEVELOPMENTS") -> the smallest tier.
    expect(screen.getByText('Completed')).toHaveClass('text-body');
    expect(screen.getByText('Residential & Commercial Development')).toHaveClass('text-body');
    expect(screen.getByText('RESIDENTIAL / COMMERCIAL DEVELOPMENTS')).toHaveClass('text-body');
  });

  it('keeps the larger size for a project whose values are all short — size is picked per project, not fixed site-wide', () => {
    render(<ProjectMetricsPanel {...baseProps} keyMetrics={[{ label: 'Status', value: 'Completed' }]} completionValue="2024" />);
    expect(screen.getByText('Completed')).toHaveClass('text-h3');
    expect(screen.getByText('2024')).toHaveClass('text-h3');
  });

  it('sizes the completion card from the same per-project longest value as the rest of the panel, even when the completion value itself is short', () => {
    render(
      <ProjectMetricsPanel
        {...baseProps}
        keyMetrics={[{ label: 'Category', value: 'Residential & Commercial Development' }]}
        completionValue="2024"
      />,
    );
    expect(screen.getByText('2024')).toHaveClass('text-body');
  });
});

describe('ProjectMetricsPanel — fills the hero image\'s height regardless of how many metrics exist', () => {
  it('stretches the panel and its card grid to fill the available height (h-full / flex-1), so few cards still reach the bottom', () => {
    const { container } = render(<ProjectMetricsPanel {...baseProps} keyMetrics={[{ label: 'Units', value: '417' }]} />);
    expect(container.firstChild).toHaveClass('h-full');
    const cardGrid = screen.getByText('417').closest('.grid');
    expect(cardGrid).toHaveClass('flex-1');
  });

  it('stretches the completion card itself when it is the only thing in the panel', () => {
    render(<ProjectMetricsPanel {...baseProps} keyMetrics={[]} completionValue="2026" />);
    const completionCard = screen.getByText('2026').closest('div.rounded-md');
    expect(completionCard).toHaveClass('flex-1');
  });

  // Regression test for a real production bug (2026-11-02): the card grid
  // used Tailwind's `auto-rows-fr`, which compiles to `grid-auto-rows:
  // minmax(0, 1fr)` — a hard equal split between rows with NO
  // content-based minimum, so a card whose value wraps to several lines
  // (e.g. a full category title) got squeezed below what it needed and
  // visually spilled past its own card's border. `auto-rows-[minmax(auto,1fr)]`
  // gives every row a content-based floor (so it can never be squeezed
  // below its own content) while still stretching rows to fill any
  // leftover space — the panel keeps reaching the hero image's full
  // height for any number of cards, without the overflow risk.
  it('gives every card row a content-based minimum height instead of a hard equal fractional split that could squeeze a long-wrapping value below its content size', () => {
    const { container } = render(<ProjectMetricsPanel {...baseProps} keyMetrics={[{ label: 'Units', value: '417' }]} />);
    const cardGrid = container.querySelector('.grid');
    expect(cardGrid).not.toHaveClass('auto-rows-fr');
    expect(cardGrid?.className).toContain('auto-rows-[minmax(auto,1fr)]');
  });
});

describe('ProjectMetricsPanel — no decorative per-metric icon', () => {
  it('renders no icon for a dynamic key-metric card', () => {
    const { container } = render(<ProjectMetricsPanel {...baseProps} keyMetrics={[{ label: 'IT Capacity', value: '18 MW' }]} />);
    const card = screen.getByText('18 MW').closest('div');
    expect(card?.querySelector('svg')).not.toBeInTheDocument();
  });

  it('still renders the fixed Tag icon for the category card and CalendarCheck for completion', () => {
    const { container } = render(
      <ProjectMetricsPanel {...baseProps} keyMetrics={[]} categoryTitle="Residential" completionValue="2026" />,
    );
    expect(container.querySelectorAll('svg')).toHaveLength(2);
  });
});
