# 🧠 Mini-Spec: OpenRouter Integration

## Overview

This specification outlines the integration of OpenRouter as an additional AI provider in the Reportly application. OpenRouter will complement the existing OpenAI integration, providing access to a wider range of AI models and potentially reducing costs.

## 🎯 Goals

- Provide access to multiple AI models beyond OpenAI
- Create a unified interface for all AI interactions
- Ensure seamless switching between providers
- Maintain backward compatibility with existing features
- Improve reliability through provider redundancy

## 🏗️ Architecture

### Unified AI Client

The core of the integration is a unified AI client that abstracts away provider-specific details:

```typescript
async function callAI({
  prompt,
  systemPrompt = "",
  temperature = 0.7,
  model = "gpt-4",
  maxTokens
}: AICallOptions): Promise<AIResponse> {
  // Provider selection based on environment variable
  switch (PROVIDER) {
    case "openai":
      return await callOpenAI(messages, temperature, model, maxTokens);
    case "openrouter":
      return await callOpenRouter(messages, temperature, model, maxTokens);
    default:
      throw new Error(`Unsupported AI provider: ${PROVIDER}`);
  }
}
```

### Model Configuration

A comprehensive model configuration system maps between provider-specific model names and provides metadata about each model:

```typescript
// Map from OpenAI model names to OpenRouter model names
export const openAIToOpenRouterModelMap: Record<string, string> = {
  "gpt-4": "openai/gpt-4-turbo",
  "gpt-4-turbo": "openai/gpt-4-turbo",
  "gpt-3.5-turbo": "openai/gpt-3.5-turbo",
};
```

### Model Selection

A model selection system chooses the appropriate model based on the task, quality requirements, and cost sensitivity:

```typescript
export function selectModel(options: ModelSelectionOptions = {}): string {
  const provider = PROVIDER;
  const task = options.task || 'general';
  const quality = options.quality || 'medium';
  const costSensitive = options.costSensitive || false;
  
  // Return the best model for this combination of parameters
}
```

## 🔧 Implementation Details

### Environment Variables

```
# AI Provider Configuration
AI_PROVIDER=openai  # Options: openai, openrouter
OPENAI_API_KEY=your-openai-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
APP_URL=https://your-app-url.com  # Required for OpenRouter

# Model-Specific Configuration
AI_SUMMARY_MODEL=gpt-3.5-turbo  # Model for summarization
AI_CATEGORY_MODEL=gpt-3.5-turbo  # Model for categorization
AI_ENHANCEMENT_MODEL=gpt-4  # Model for text enhancement
AI_SUGGESTION_MODEL=gpt-4  # Model for suggestions
```

### OpenRouter API Integration

The OpenRouter API client handles the specific requirements of the OpenRouter API:

```typescript
async function callOpenRouter(messages, temperature, model, maxTokens) {
  // Map OpenAI model names to OpenRouter model names if needed
  const mappedModel = mapOpenAIToOpenRouter(model);
  
  // Make the API request with the required headers
  const response = await axios.post(
    "https://openrouter.ai/api/v1/chat/completions",
    { model: mappedModel, messages, temperature, max_tokens: maxTokens },
    {
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
        "X-Title": "Reportly AI Assistant",
      },
    }
  );
  
  // Process and return the response
  return { content, meta };
}
```

### Feature Integration

All existing AI features will be updated to use the unified AI client:

1. **Report Summarization**: `generateSummary.js`
2. **Report Categorization**: `categorizeReport.js`
3. **Text Enhancement**: `enhanceText.js`
4. **Suggestion Generation**: `fetchSuggestions.ts`

## 📊 Data Flow

1. User action triggers an AI feature (e.g., saving a report)
2. The feature calls the unified AI client with the appropriate parameters
3. The client determines the provider based on environment variables
4. The client calls the provider-specific implementation
5. The provider makes the API request and processes the response
6. The response is returned to the feature in a standardized format
7. The feature uses the response to update the UI or database

## 🔒 Security Considerations

- API keys are stored in environment variables, not in code
- API keys are never exposed to the client
- All API requests are made server-side
- HTTPS is used for all API requests

## 🧪 Testing Strategy

### Unit Tests

- Test provider selection based on environment variables
- Test model mapping between providers
- Test error handling for various scenarios

### Integration Tests

- Test each AI feature with both providers
- Test switching between providers
- Test with various model configurations

### Manual Tests

- Comprehensive manual test script for QA
- Performance comparison between providers
- Cost comparison between providers

## 📝 Documentation

- Technical specification for AI providers
- Implementation details and changes summary
- Manual test scripts for QA
- Updated environment variable documentation

## 🚀 Future Enhancements

- Add support for additional AI providers (e.g., Anthropic, Cohere)
- Implement automatic fallback between providers
- Create a provider performance comparison dashboard
- Implement cost optimization strategies
