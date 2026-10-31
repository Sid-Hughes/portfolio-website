import { component, defineMarkdocConfig } from '@astrojs/markdoc/config';

// Custom Markdoc tags. Each one mirrors a content component in keystatic.config.ts.
export default defineMarkdocConfig({
  tags: {
    pipeline: {
      render: component('./src/components/motion/PipelineDiagram.astro'),
      selfClosing: true,
      attributes: {
        nodes: { type: Array, required: true },
        caption: { type: String },
      },
    },
  },
});
