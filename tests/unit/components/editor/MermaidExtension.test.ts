import MermaidExtension from '@/components/editor/extensions/mermaidExtension';

describe('MermaidExtension', () => {
  it('should be properly configured', () => {
    // Test the basic configuration of the extension
    expect(MermaidExtension.name).toBe('mermaidDiagram');
    expect(MermaidExtension.group).toBe('block');
    
    // Test that it has the correct attributes
    const attributes = MermaidExtension.addAttributes?.() || {};
    expect(attributes).toHaveProperty('language');
    expect(attributes.language).toHaveProperty('default', null);
    
    // Test that it has parseHTML and renderHTML methods
    expect(typeof MermaidExtension.parseHTML).toBe('function');
    expect(typeof MermaidExtension.renderHTML).toBe('function');
    
    // Test that it has a nodeView renderer
    expect(typeof MermaidExtension.addNodeView).toBe('function');
  });
  
  it('should only parse pre elements with mermaid language', () => {
    // Get the parseHTML rules
    const parseRules = MermaidExtension.parseHTML?.() || [];
    expect(parseRules.length).toBeGreaterThan(0);
    
    const firstRule = parseRules[0];
    expect(firstRule).toHaveProperty('tag', 'pre');
    expect(firstRule).toHaveProperty('preserveWhitespace', 'full');
    
    // Test the getAttrs function with a mermaid element
    const mermaidElement = document.createElement('pre');
    mermaidElement.setAttribute('data-language', 'mermaid');
    
    const nonMermaidElement = document.createElement('pre');
    nonMermaidElement.setAttribute('data-language', 'javascript');
    
    // @ts-ignore - Accessing getAttrs which might be undefined
    const mermaidAttrs = firstRule.getAttrs(mermaidElement);
    // @ts-ignore - Accessing getAttrs which might be undefined
    const nonMermaidAttrs = firstRule.getAttrs(nonMermaidElement);
    
    // Should return attributes for mermaid elements
    expect(mermaidAttrs).toEqual({ language: 'mermaid' });
    
    // Should return false for non-mermaid elements
    expect(nonMermaidAttrs).toBe(false);
  });
});
