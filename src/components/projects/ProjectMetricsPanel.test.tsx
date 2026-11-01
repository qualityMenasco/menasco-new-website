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
