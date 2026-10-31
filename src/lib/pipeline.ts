// Node colours for the pipeline diagram, shared by the Keystatic schema and the component.
// `accent` follows the theme; the rest are fixed mid-tones that read on light and dark backgrounds.
export const pipelineColours = {
  accent: { label: 'Accent', stroke: 'var(--accent)' },
  blue: { label: 'Blue', stroke: '#3b82f6' },
  green: { label: 'Green', stroke: '#16a34a' },
  amber: { label: 'Amber', stroke: '#d97706' },
  rose: { label: 'Rose', stroke: '#e11d48' },
  slate: { label: 'Slate', stroke: '#64748b' },
} as const;

export type PipelineColour = keyof typeof pipelineColours;

export const pipelineColourOptions = Object.entries(pipelineColours).map(([value, { label }]) => ({
  value,
  label,
}));
