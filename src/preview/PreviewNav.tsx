const sections = [
  { id: 'foundations', label: 'Foundations' },
  { id: 'layout', label: 'Layout' },
  { id: 'actions', label: 'Actions' },
  { id: 'cards', label: 'Cards' },
  { id: 'data', label: 'Data' },
  { id: 'content', label: 'Content' },
  { id: 'interactive', label: 'Interactive' },
  { id: 'forms', label: 'Forms' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'feedback', label: 'Feedback' },
];

/** Dev-tool chrome for this preview only — deliberately distinct from the product header. */
export function PreviewNav() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-ink">
      <div className="mx-auto flex max-w-wide items-center gap-6 overflow-x-auto px-6 py-3 md:px-10">
        <span className="shrink-0 font-mono text-caption font-semibold uppercase tracking-widest text-gray-400">
          Component Preview
        </span>
        <nav aria-label="Component sections">
          <ul className="flex shrink-0 items-center gap-5">
            {sections.map((section) => (
              <li key={section.id}>
                <a href={`#${section.id}`} className="whitespace-nowrap text-caption font-medium text-gray-300 transition-colors duration-base hover:text-warmwhite">
                  {section.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
