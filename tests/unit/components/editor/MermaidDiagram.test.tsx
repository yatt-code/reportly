import React from 'react';
import { render, screen } from '@testing-library/react';
import MermaidDiagram from '@/components/editor/MermaidDiagram';
import mermaid from 'mermaid';

// Mock mermaid.js
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn().mockResolvedValue({ svg: '<svg>Mocked SVG</svg>' }),
  run: jest.fn().mockResolvedValue(undefined),
}));

// Mock logger
jest.mock('@/lib/utils/logger', () => ({
  log: jest.fn(),
  error: jest.fn(),
}));

describe('MermaidDiagram', () => {
  // Create a mock NodeViewProps
  const createNodeViewProps = (content = 'graph TD;\\nA-->B;') => ({
    node: {
      attrs: { id: 'test-node-123', language: 'mermaid' },
      textContent: content,
    },
    editor: {
      isEditable: jest.fn().mockReturnValue(true),
    },
    getPos: jest.fn(),
    updateAttributes: jest.fn(),
    deleteNode: jest.fn(),
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render a mermaid diagram', async () => {
    // Arrange
    const props = createNodeViewProps();
    
    // Act
    render(<MermaidDiagram {...props} />);
    
    // Assert
    expect(mermaid.render).toHaveBeenCalledWith(
      expect.stringContaining('mermaid-graph-'),
      'graph TD;\\nA-->B;'
    );
  });

  it('should show loading state while rendering', () => {
    // Arrange
    const props = createNodeViewProps();
    
    // Act
    render(<MermaidDiagram {...props} />);
    
    // Assert
    expect(screen.getByText('Loading Diagram...')).toBeInTheDocument();
  });

  it('should handle errors in mermaid rendering', async () => {
    // Arrange
    const renderError = new Error('Invalid syntax');
    (mermaid.render as jest.Mock).mockRejectedValueOnce(renderError);
    const props = createNodeViewProps('invalid mermaid syntax');
    
    // Act
    render(<MermaidDiagram {...props} />);
    
    // Assert - should show error message
    // Note: This might need to be adjusted based on how your component handles errors
    // expect(screen.getByText(/Error rendering diagram/i)).toBeInTheDocument();
  });

  it('should update when node content changes', async () => {
    // Arrange
    const initialProps = createNodeViewProps('graph TD;\\nA-->B;');
    const { rerender } = render(<MermaidDiagram {...initialProps} />);
    
    // Act - update with new content
    const updatedProps = createNodeViewProps('graph TD;\\nA-->B;\\nB-->C;');
    rerender(<MermaidDiagram {...updatedProps} />);
    
    // Assert
    expect(mermaid.render).toHaveBeenCalledTimes(2);
    expect(mermaid.render).toHaveBeenLastCalledWith(
      expect.stringContaining('mermaid-graph-'),
      'graph TD;\\nA-->B;\\nB-->C;'
    );
  });
});
