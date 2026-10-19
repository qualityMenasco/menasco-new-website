import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProjectDetailTabs, type ProjectDetailTab } from './ProjectDetailTabs';

const TWO_TABS: ProjectDetailTab[] = [
  { id: 'overview', label: 'Overview', content: 'Overview paragraph.' },
  { id: 'scope', label: 'Scope of Work', content: 'Scope paragraph.' },
];

describe('ProjectDetailTabs — no tabs', () => {
  it('renders nothing', () => {
    const { container } = render(<ProjectDetailTabs tabs={[]} />);
    expect(container.firstChild).toBeNull();
  });
});

describe('ProjectDetailTabs — a single tab (e.g. no menascoScope yet)', () => {
  it('renders the content plainly with no tab chrome', () => {
    render(<ProjectDetailTabs tabs={[TWO_TABS[0]]} />);
    expect(screen.getByText('Overview paragraph.')).toBeInTheDocument();
    expect(screen.queryByRole('tablist')).not.toBeInTheDocument();
    expect(screen.queryByRole('tab')).not.toBeInTheDocument();
  });
});

describe('ProjectDetailTabs — multiple tabs', () => {
  it('shows the first tab active and its content by default', () => {
    render(<ProjectDetailTabs tabs={TWO_TABS} />);
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Scope of Work' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Overview paragraph.')).toBeInTheDocument();
    expect(screen.queryByText('Scope paragraph.')).not.toBeInTheDocument();
  });

  it('clicking the second tab switches the active tab and its panel content', () => {
    render(<ProjectDetailTabs tabs={TWO_TABS} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Scope of Work' }));
    expect(screen.getByRole('tab', { name: 'Scope of Work' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Overview' })).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByText('Scope paragraph.')).toBeInTheDocument();
    expect(screen.queryByText('Overview paragraph.')).not.toBeInTheDocument();
  });

  it('switching back to the first tab restores its content', () => {
    render(<ProjectDetailTabs tabs={TWO_TABS} />);
    fireEvent.click(screen.getByRole('tab', { name: 'Scope of Work' }));
    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(screen.getByText('Overview paragraph.')).toBeInTheDocument();
  });
});
