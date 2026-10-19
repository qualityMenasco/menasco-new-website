import { useId, useState } from 'react';
import { cn } from '../../lib/utils';
import { Text } from '../typography/Typography';

export interface ProjectDetailTab {
  id: string;
  label: string;
  content: string;
}

export interface ProjectDetailTabsProps {
  /** Only tabs with non-empty content should be passed — the caller filters, this component just renders whatever it's given. */
  tabs: ProjectDetailTab[];
  className?: string;
}

/**
 * Overview / Scope of Work tabs for the standard project detail template
 * (see the approved wireframe's `.tabs`/`.panel`). If only one tab has
 * content (e.g. a project with no `menascoScope` yet), renders that
 * content plainly with no tab chrome rather than a single useless tab.
 */
export function ProjectDetailTabs({ tabs, className }: ProjectDetailTabsProps) {
  const [activeId, setActiveId] = useState(tabs[0]?.id);
  const baseId = useId();

  if (tabs.length === 0) return null;

  if (tabs.length === 1) {
    return (
      <div className={className}>
        <Text variant="body-lg" className="leading-[1.8]">
          {tabs[0].content}
        </Text>
      </div>
    );
  }

  const active = tabs.find((tab) => tab.id === activeId) ?? tabs[0];

  return (
    <div className={className}>
      <div role="tablist" className="flex gap-6 border-b border-gray-200">
        {tabs.map((tab) => {
          const selected = tab.id === active.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${tab.id}`}
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              onClick={() => setActiveId(tab.id)}
              className={cn(
                'border-b-2 border-transparent px-1 py-3.5 text-body font-medium text-gray-500 transition-colors',
                selected && 'border-brand-600 font-semibold text-brand-600',
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div role="tabpanel" id={`${baseId}-panel`} aria-labelledby={`${baseId}-tab-${active.id}`} className="py-5">
        <Text variant="body-lg" className="leading-[1.8]">
          {active.content}
        </Text>
      </div>
    </div>
  );
}
