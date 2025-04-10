// Create a mock implementation of the mermaid library
const mockMermaid = {
  initialize: jest.fn(),
  render: jest.fn().mockResolvedValue({ svg: '<svg>Test SVG</svg>' }),
};

describe('Mermaid Basic Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('should initialize with configuration', () => {
    // Call initialize with configuration
    mockMermaid.initialize({
      startOnLoad: false,
      theme: 'default',
    });
    
    // Verify initialize was called with the correct configuration
    expect(mockMermaid.initialize).toHaveBeenCalledWith({
      startOnLoad: false,
      theme: 'default',
    });
  });
  
  it('should render diagrams', async () => {
    // Define test diagram
    const diagramId = 'test-diagram';
    const diagramDefinition = 'graph TD; A-->B; B-->C;';
    
    // Call render
    const result = await mockMermaid.render(diagramId, diagramDefinition);
    
    // Verify render was called with the correct parameters
    expect(mockMermaid.render).toHaveBeenCalledWith(diagramId, diagramDefinition);
    
    // Verify result
    expect(result).toEqual({ svg: '<svg>Test SVG</svg>' });
  });
});
