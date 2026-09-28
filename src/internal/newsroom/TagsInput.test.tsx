import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TagsInput } from './TagsInput';
import { MAX_TOPICS } from './tagUtils';
import type { ArticleTag } from './types';

const EXISTING: ArticleTag[] = [
  { name: 'MEP', slug: 'mep' },
  { name: 'Digital Coordination', slug: 'digital-coordination' },
];

function getInput() {
  return screen.getByLabelText('Add a topic') as HTMLInputElement;
}

describe('TagsInput — populating from an existing article', () => {
  it('renders chips for existing tags without calling onChange on mount', () => {
    const onChange = vi.fn();
    render(<TagsInput tags={EXISTING} onChange={onChange} />);
    expect(screen.getByText('MEP')).toBeInTheDocument();
    expect(screen.getByText('Digital Coordination')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('renders no chips for a fresh article with no tags yet', () => {
    render(<TagsInput tags={[]} onChange={vi.fn()} />);
    expect(screen.queryByRole('button', { name: /Remove/ })).not.toBeInTheDocument();
  });
});

describe('TagsInput — adding topics', () => {
  it('Enter adds the typed topic as a chip', () => {
    const onChange = vi.fn();
    render(<TagsInput tags={[]} onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: 'BIM' } });
    fireEvent.keyDown(getInput(), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith([{ name: 'BIM', slug: 'bim' }]);
  });

  it('comma also adds the typed topic', () => {
    const onChange = vi.fn();
    render(<TagsInput tags={[]} onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: 'Prefabrication' } });
    fireEvent.keyDown(getInput(), { key: ',' });
    expect(onChange).toHaveBeenCalledWith([{ name: 'Prefabrication', slug: 'prefabrication' }]);
  });

  it('clears the input field after a successful add', () => {
    render(<TagsInput tags={[]} onChange={vi.fn()} />);
    fireEvent.change(getInput(), { target: { value: 'BIM' } });
    fireEvent.keyDown(getInput(), { key: 'Enter' });
    expect(getInput().value).toBe('');
  });

  it('supports multi-word topics', () => {
    const onChange = vi.fn();
    render(<TagsInput tags={[]} onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: 'Mission Critical' } });
    fireEvent.keyDown(getInput(), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith([{ name: 'Mission Critical', slug: 'mission-critical' }]);
  });

  it('trims whitespace before adding', () => {
    const onChange = vi.fn();
    render(<TagsInput tags={[]} onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: '   BIM   ' } });
    fireEvent.keyDown(getInput(), { key: 'Enter' });
    expect(onChange).toHaveBeenCalledWith([{ name: 'BIM', slug: 'bim' }]);
  });

  it('ignores empty input — Enter on a blank field adds nothing and does not call onChange', () => {
    const onChange = vi.fn();
    render(<TagsInput tags={[]} onChange={onChange} />);
    fireEvent.keyDown(getInput(), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
  });
});

describe('TagsInput — removing topics', () => {
  it('clicking × removes that topic and preserves the rest', () => {
    const onChange = vi.fn();
    render(<TagsInput tags={EXISTING} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText('Remove MEP'));
    expect(onChange).toHaveBeenCalledWith([{ name: 'Digital Coordination', slug: 'digital-coordination' }]);
  });
});

describe('TagsInput — duplicate prevention', () => {
  it('rejects an exact duplicate and shows a validation message instead of calling onChange', () => {
    const onChange = vi.fn();
    render(<TagsInput tags={EXISTING} onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: 'MEP' } });
    fireEvent.keyDown(getInput(), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/already been added/)).toBeInTheDocument();
  });

  it('rejects a case-insensitive duplicate ("mep" vs existing "MEP")', () => {
    const onChange = vi.fn();
    render(<TagsInput tags={EXISTING} onChange={onChange} />);
    fireEvent.change(getInput(), { target: { value: 'mep' } });
    fireEvent.keyDown(getInput(), { key: 'Enter' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByText(/already been added/)).toBeInTheDocument();
  });
});

describe('TagsInput — maximum topic limit', () => {
  const AT_LIMIT: ArticleTag[] = Array.from({ length: MAX_TOPICS }, (_, i) => ({ name: `Topic ${i}`, slug: `topic-${i}` }));

  it('disables the input once the limit is reached', () => {
    render(<TagsInput tags={AT_LIMIT} onChange={vi.fn()} />);
    expect(getInput()).toBeDisabled();
  });

  it('still renders all existing chips at/over the limit without erasing any', () => {
    render(<TagsInput tags={AT_LIMIT} onChange={vi.fn()} />);
    AT_LIMIT.forEach((tag) => expect(screen.getByText(tag.name)).toBeInTheDocument());
  });
});

describe('TagsInput — layout', () => {
  it('wraps chips in a flex-wrap container so they flow onto additional lines on narrow viewports', () => {
    const { container } = render(<TagsInput tags={EXISTING} onChange={vi.fn()} />);
    const chipRow = container.querySelector('.flex-wrap');
    expect(chipRow).toBeInTheDocument();
  });
});
