import { useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { ArticleTag } from './types';
import { addTopic, removeTopic, MAX_TOPICS } from './tagUtils';
import { inputBaseClasses } from '../../components/forms/fieldStyles';

export interface TagsInputProps {
  tags: ArticleTag[];
  /** Called only when the chip set actually changes (add/remove) — never on mount, never just from typing. */
  onChange: (tags: ArticleTag[]) => void;
}

/**
 * Compact chip-based topic/keyword editor for the Newsroom admin. Reads
 * `article.tags` (the existing `{name, slug}[]` field already persisted by
 * updateArticleMetadata) and writes back the same shape — no new field, no
 * migration. Enter or comma commits the current input as a chip; typing
 * alone never mutates the article.
 */
export function TagsInput({ tags, onChange }: TagsInputProps) {
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const atLimit = tags.length >= MAX_TOPICS;

  function commit(raw: string) {
    const result = addTopic(tags, raw);
    if (result.error) {
      setError(result.error);
      return;
    }
    setError(null);
    setInputValue('');
    if (result.tags !== tags) onChange(result.tags);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      commit(inputValue);
    }
  }

  function handleRemove(index: number) {
    setError(null);
    onChange(removeTopic(tags, index));
  }

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={tag.slug}
              className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-caption text-gray-700"
            >
              <span className="break-words">{tag.name}</span>
              <button
                type="button"
                onClick={() => handleRemove(index)}
                aria-label={`Remove ${tag.name}`}
                className="text-gray-400 transition-colors hover:text-gray-700"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}

      <input
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value);
          if (error) setError(null);
        }}
        onKeyDown={handleKeyDown}
        placeholder={atLimit ? `Maximum ${MAX_TOPICS} topics reached` : 'Add a topic...'}
        disabled={atLimit}
        aria-label="Add a topic"
        className={inputBaseClasses('light', false)}
      />

      {error && <p className="text-caption text-error">{error}</p>}
      <p className="text-caption text-gray-400">
        {tags.length} / {MAX_TOPICS} topics
      </p>
    </div>
  );
}
