import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';
import { Textarea } from '../../components/forms/Textarea';
import { TextField } from '../../components/forms/TextField';
import { Select } from '../../components/forms/Select';
import { Button, IconButton } from '../../components/ui/Button';
import type { ArticleImage, ArticleSection, ContentBlock, ContentBlockType, StructuredContent } from './types';

/**
 * A restrained structured-block editor for the six Phase 2 block types —
 * deliberately not a rich-text/Notion-style editor (no drag-and-drop
 * library exists in this repo and none was added for this; reordering is
 * plain move-up/move-down buttons, which is simple, keyboard-usable, and
 * has zero new dependencies). `sourcePages` (provenance from the original
 * PDF) is preserved on every edit that doesn't require regenerating it —
 * only add/remove/type-change operations touch it, and only because there
 * is no sensible provenance value to carry forward on a genuinely new or
 * deleted block.
 */

const BLOCK_TYPE_OPTIONS: { label: string; value: ContentBlockType }[] = [
  { label: 'Paragraph', value: 'paragraph' },
  { label: 'Heading', value: 'heading' },
  { label: 'Bullet list', value: 'bullet_list' },
  { label: 'Numbered list', value: 'numbered_list' },
  { label: 'Quote', value: 'quote' },
  { label: 'Image', value: 'image' },
];

function blankBlockOfType(type: ContentBlockType): ContentBlock {
  switch (type) {
    case 'paragraph':
      return { type: 'paragraph', text: '' };
    case 'heading':
      return { type: 'heading', text: '', level: 3 };
    case 'bullet_list':
      return { type: 'bullet_list', items: [''] };
    case 'numbered_list':
      return { type: 'numbered_list', items: [''] };
    case 'quote':
      return { type: 'quote', text: '' };
    case 'image':
      return { type: 'image', imageId: '' };
  }
}

function move<T>(list: T[], index: number, direction: -1 | 1): T[] {
  const target = index + direction;
  if (target < 0 || target >= list.length) return list;
  const copy = [...list];
  [copy[index], copy[target]] = [copy[target], copy[index]];
  return copy;
}

interface BlockEditorProps {
  block: ContentBlock;
  images: ArticleImage[];
  onChange: (block: ContentBlock) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function BlockControls({ onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: Omit<BlockEditorProps, 'block' | 'images' | 'onChange'>) {
  return (
    <div className="flex shrink-0 flex-col gap-1">
      <IconButton icon={ArrowUp} label="Move up" size="sm" onClick={onMoveUp} disabled={!canMoveUp} />
      <IconButton icon={ArrowDown} label="Move down" size="sm" onClick={onMoveDown} disabled={!canMoveDown} />
      <IconButton icon={Trash2} label="Delete" size="sm" onClick={onDelete} />
    </div>
  );
}

function BlockEditor(props: BlockEditorProps) {
  const { block, images, onChange } = props;

  const typeSelect = (
    <Select
      label="Block type"
      containerClassName="w-40 shrink-0"
      options={BLOCK_TYPE_OPTIONS}
      value={block.type}
      onChange={(e) => {
        const nextType = e.target.value as ContentBlockType;
        if (nextType === block.type) return;
        // Best-effort content carry-over between compatible types (e.g. paragraph <-> quote/heading text; list <-> list items) — never silently discards user text without an obvious reason.
        const next = blankBlockOfType(nextType);
        if ('text' in next && 'text' in block) next.text = block.text;
        if ('items' in next && 'items' in block) next.items = block.items;
        if ('text' in next && 'items' in block) next.text = block.items.join('\n');
        if ('items' in next && 'text' in block) next.items = block.text.split('\n').filter(Boolean);
        next.sourcePages = block.sourcePages;
        onChange(next);
      }}
    />
  );

  let fields: React.ReactNode;
  switch (block.type) {
    case 'paragraph':
    case 'quote':
      fields = <Textarea label={block.type === 'quote' ? 'Quote text' : 'Paragraph text'} rows={3} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />;
      break;
    case 'heading':
      fields = (
        <div className="flex gap-3">
          <TextField label="Heading text" containerClassName="flex-1" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} />
          <Select
            label="Level"
            containerClassName="w-28 shrink-0"
            options={[{ label: 'H2', value: '2' }, { label: 'H3', value: '3' }]}
            value={String(block.level ?? 3)}
            onChange={(e) => onChange({ ...block, level: Number(e.target.value) as 2 | 3 })}
          />
        </div>
      );
      break;
    case 'bullet_list':
    case 'numbered_list':
      fields = (
        <Textarea
          label={block.type === 'bullet_list' ? 'Bullet items (one per line)' : 'Numbered items (one per line)'}
          rows={4}
          value={block.items.join('\n')}
          onChange={(e) => onChange({ ...block, items: e.target.value.split('\n') })}
        />
      );
      break;
    case 'image':
      fields = (
        <div className="flex gap-3">
          <Select
            label="Image"
            containerClassName="flex-1"
            placeholder="Select an uploaded image…"
            options={images.map((img) => ({ label: img.altText || img.s3Key.split('/').pop() || img.id, value: img.id }))}
            value={block.imageId}
            onChange={(e) => onChange({ ...block, imageId: e.target.value })}
          />
          <TextField label="Caption" containerClassName="flex-1" value={block.caption ?? ''} onChange={(e) => onChange({ ...block, caption: e.target.value })} />
        </div>
      );
      break;
  }

  return (
    <div className="flex gap-3 rounded-md border border-gray-200 bg-warmwhite p-3">
      <div className="flex-1 space-y-2">
        <div className="flex items-start gap-3">
          {typeSelect}
          <div className="flex-1">{fields}</div>
        </div>
        {block.sourcePages && block.sourcePages.length > 0 && (
          <p className="text-caption text-gray-500">Source page{block.sourcePages.length > 1 ? 's' : ''}: {block.sourcePages.join(', ')}</p>
        )}
      </div>
      <BlockControls {...props} />
    </div>
  );
}

interface SectionEditorProps {
  section: ArticleSection;
  images: ArticleImage[];
  onChange: (section: ArticleSection) => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

function SectionEditor({ section, images, onChange, onDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: SectionEditorProps) {
  function updateBlock(index: number, block: ContentBlock) {
    const blocks = [...section.blocks];
    blocks[index] = block;
    onChange({ ...section, blocks });
  }
  function deleteBlock(index: number) {
    onChange({ ...section, blocks: section.blocks.filter((_, i) => i !== index) });
  }
  function addBlock(type: ContentBlockType) {
    onChange({ ...section, blocks: [...section.blocks, blankBlockOfType(type)] });
  }

  return (
    <div className="space-y-3 rounded-lg border border-gray-300 bg-white p-4">
      <div className="flex items-start gap-3">
        <TextField
          label="Section heading (leave blank for a headless intro/closing section)"
          containerClassName="flex-1"
          value={section.heading ?? ''}
          onChange={(e) => onChange({ ...section, heading: e.target.value || undefined })}
        />
        <BlockControls onDelete={onDelete} onMoveUp={onMoveUp} onMoveDown={onMoveDown} canMoveUp={canMoveUp} canMoveDown={canMoveDown} />
      </div>

      <div className="space-y-2">
        {section.blocks.map((block, i) => (
          <BlockEditor
            // eslint-disable-next-line react/no-array-index-key
            key={i}
            block={block}
            images={images}
            onChange={(b) => updateBlock(i, b)}
            onDelete={() => deleteBlock(i)}
            onMoveUp={() => onChange({ ...section, blocks: move(section.blocks, i, -1) })}
            onMoveDown={() => onChange({ ...section, blocks: move(section.blocks, i, 1) })}
            canMoveUp={i > 0}
            canMoveDown={i < section.blocks.length - 1}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {BLOCK_TYPE_OPTIONS.map((opt) => (
          <Button key={opt.value} variant="outline" size="sm" leadingIcon={Plus} onClick={() => addBlock(opt.value)}>
            {opt.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export interface StructuredContentEditorProps {
  value: StructuredContent;
  images: ArticleImage[];
  onChange: (value: StructuredContent) => void;
}

export function StructuredContentEditor({ value, images, onChange }: StructuredContentEditorProps) {
  function updateSection(index: number, section: ArticleSection) {
    const sections = [...value.sections];
    sections[index] = section;
    onChange({ ...value, sections });
  }
  function deleteSection(index: number) {
    onChange({ ...value, sections: value.sections.filter((_, i) => i !== index) });
  }
  function addSection() {
    onChange({ ...value, sections: [...value.sections, { blocks: [blankBlockOfType('paragraph')] }] });
  }

  return (
    <div className="space-y-4">
      <p className="text-caption text-gray-500">
        Extracted from: {value.source.extractor} · {value.source.pageCount ?? '?'} page(s) · {new Date(value.source.extractedAt).toLocaleString()}
      </p>
      {value.sections.map((section, i) => (
        <SectionEditor
          // eslint-disable-next-line react/no-array-index-key
          key={i}
          section={section}
          images={images}
          onChange={(s) => updateSection(i, s)}
          onDelete={() => deleteSection(i)}
          onMoveUp={() => onChange({ ...value, sections: move(value.sections, i, -1) })}
          onMoveDown={() => onChange({ ...value, sections: move(value.sections, i, 1) })}
          canMoveUp={i > 0}
          canMoveDown={i < value.sections.length - 1}
        />
      ))}
      <Button variant="outline" leadingIcon={Plus} onClick={addSection}>
        Add section
      </Button>
    </div>
  );
}
