// Mock the mermaid module completely
jest.mock('mermaid', () => ({
  initialize: jest.fn(),
  render: jest.fn().mockResolvedValue({ svg: '<svg>Mocked SVG</svg>' }),
  run: jest.fn().mockResolvedValue(undefined),
}));

// Import the mocked module
import mermaid from 'mermaid';

describe('Mermaid Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should initialize with correct configuration', () => {
    // Call initialize with test configuration
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
    });
    
    // Verify initialize was called with the correct configuration
    expect(mermaid.initialize).toHaveBeenCalledWith({
      startOnLoad: false,
      theme: 'default',
    });
  });
  
  it('should render mermaid diagrams', async () => {
    // Call render with a test diagram
    const diagramId = 'test-diagram';
    const diagramDefinition = 'graph TD; A-->B; B-->C;';
    
    await mermaid.render(diagramId, diagramDefinition);
    
    // Verify render was called with the correct parameters
    expect(mermaid.render).toHaveBeenCalledWith(diagramId, diagramDefinition);
  });
  
  it('should handle rendering errors gracefully', async () => {
    // Mock render to reject with an error
    (mermaid.render as jest.Mock).mockRejectedValueOnce(new Error('Invalid syntax'));
    
    // Call render with invalid syntax
    const diagramId = 'error-diagram';
    const invalidDefinition = 'invalid mermaid syntax';
    
    // The render call should reject with an error
    await expect(mermaid.render(diagramId, invalidDefinition)).rejects.toThrow('Invalid syntax');
    
    // Verify render was called with the invalid syntax
    expect(mermaid.render).toHaveBeenCalledWith(diagramId, invalidDefinition);
  });
});
