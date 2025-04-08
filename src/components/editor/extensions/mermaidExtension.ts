import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import MermaidDiagram from '../MermaidDiagram'; // We'll create this component next

/**
 * Custom TipTap Node for rendering Mermaid diagrams.
 * It extends the CodeBlock node specifically looking for the 'mermaid' language attribute.
 */
const MermaidExtension = Node.create({
  name: 'mermaidDiagram', // Unique name for the node
  group: 'block',
  content: 'text*', // Contains text content (the Mermaid definition)
  marks: '',
  defining: true,
  isolating: true,

  // Use the same attributes as CodeBlock, especially 'language'
  addAttributes() {
    return {
      language: {
        default: null,
        parseHTML: element => element.getAttribute('data-language'),
        renderHTML: attributes => {
          if (!attributes.language) {
            return {};
          }
          return {
            'data-language': attributes.language,
            // Add a class for potential styling
            'class': `language-${attributes.language}`,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        // Match pre > code elements with data-language="mermaid"
        tag: 'pre',
        preserveWhitespace: 'full',
        // Removed custom getContent - TipTap's default text extraction should work for pre > code
        // Only parse if it's explicitly a mermaid block
        getAttrs: node => (node instanceof Element && node.getAttribute('data-language') === 'mermaid') ? { language: 'mermaid' } : false, // Only parse if language is mermaid
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    // Render as a pre > code block structure, but the node view will take over rendering
    return ['pre', mergeAttributes(HTMLAttributes), ['code', 0]];
  },

  // Use a React Node View to render the Mermaid diagram component
  addNodeView() {
    return ReactNodeViewRenderer(MermaidDiagram);
  },

  // Ensure it behaves like a code block in terms of input/paste rules if needed
  // addInputRules() { ... }
  // addPasteRules() { ... }
});

export default MermaidExtension;