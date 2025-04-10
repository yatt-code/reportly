// Mock the MermaidDiagram component
jest.mock('@/components/editor/MermaidDiagram', () => 'div');

// Mock the ReactNodeViewRenderer
jest.mock('@tiptap/react', () => ({
  ReactNodeViewRenderer: jest.fn().mockReturnValue('mock-node-view-renderer'),
}));

// Import the extension (which now uses mocked dependencies)
import MermaidExtension from '@/components/editor/extensions/mermaidExtension';
import { ReactNodeViewRenderer } from '@tiptap/react';

describe('MermaidExtension', () => {
  it('should be configured correctly', () => {
    // Test basic properties
    expect(MermaidExtension.name).toBe('mermaidDiagram');
    expect(MermaidExtension.group).toBe('block');
    expect(MermaidExtension.content).toBe('text*');
    expect(MermaidExtension.marks).toBe('');
    expect(MermaidExtension.defining).toBe(true);
    expect(MermaidExtension.isolating).toBe(true);
  });
  
  it('should have language attribute', () => {
    // Get attributes
    const attributes = MermaidExtension.addAttributes?.();
    
    // Verify language attribute exists and has correct properties
    expect(attributes).toBeDefined();
    expect(attributes).toHaveProperty('language');
    expect(attributes.language).toHaveProperty('default', null);
    
    // Test parseHTML function
    const mockElement = document.createElement('div');
    mockElement.setAttribute('data-language', 'mermaid');
    expect(attributes.language.parseHTML(mockElement)).toBe('mermaid');
    
    // Test renderHTML function with language
    const htmlAttrs = attributes.language.renderHTML({ language: 'mermaid' });
    expect(htmlAttrs).toEqual({
      'data-language': 'mermaid',
      'class': 'language-mermaid',
    });
    
    // Test renderHTML function without language
    const emptyHtmlAttrs = attributes.language.renderHTML({});
    expect(emptyHtmlAttrs).toEqual({});
  });
  
  it('should parse HTML correctly', () => {
    // Get parseHTML rules
    const parseRules = MermaidExtension.parseHTML?.();
    
    // Verify rules exist
    expect(parseRules).toBeDefined();
    expect(parseRules.length).toBeGreaterThan(0);
    
    // Test first rule
    const firstRule = parseRules[0];
    expect(firstRule.tag).toBe('pre');
    expect(firstRule.preserveWhitespace).toBe('full');
    
    // Test getAttrs function with mermaid element
    const mermaidElement = document.createElement('pre');
    mermaidElement.setAttribute('data-language', 'mermaid');
    expect(firstRule.getAttrs(mermaidElement)).toEqual({ language: 'mermaid' });
    
    // Test getAttrs function with non-mermaid element
    const nonMermaidElement = document.createElement('pre');
    nonMermaidElement.setAttribute('data-language', 'javascript');
    expect(firstRule.getAttrs(nonMermaidElement)).toBe(false);
  });
  
  it('should render HTML correctly', () => {
    // Test renderHTML function
    const renderResult = MermaidExtension.renderHTML?.({ HTMLAttributes: { class: 'test-class' } });
    
    // Verify result structure (pre > code)
    expect(renderResult).toEqual(['pre', { class: 'test-class' }, ['code', 0]]);
  });
  
  it('should use ReactNodeViewRenderer for node view', () => {
    // Test addNodeView function
    const nodeView = MermaidExtension.addNodeView?.();
    
    // Verify ReactNodeViewRenderer was called
    expect(ReactNodeViewRenderer).toHaveBeenCalled();
    expect(nodeView).toBe('mock-node-view-renderer');
  });
});
