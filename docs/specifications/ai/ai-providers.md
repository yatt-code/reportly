# 🧠 Technical Specification: AI Provider Integration

## Overview

Reportly supports multiple AI providers to power its AI features. This document outlines the architecture and configuration for integrating different AI providers, with a focus on OpenAI and OpenRouter.

*For detailed implementation information, see the [OpenRouter Integration Mini-Spec](./openrouter-integration.md) and the [AI Providers Changes Summary](../../implementation/changes/ai-providers.md).*

## Supported Providers

### OpenAI

OpenAI is the default AI provider for Reportly, offering access to models like GPT-4 and GPT-3.5 Turbo. These models power features such as:

- Report summarization
- Content categorization
- Writing suggestions
- Text enhancement

### OpenRouter

OpenRouter is an alternative AI provider that offers access to a wide range of models from different providers, including:

- OpenAI models (GPT-4, GPT-3.5)
- Anthropic models (Claude 3 Opus, Claude 3 Sonnet)
- Google models (Gemini Pro)
- And many more

## Architecture

The AI provider integration is designed with a unified interface that abstracts away the specific provider implementation details. This allows for seamless switching between providers without changing the application code.

### Key Components

1. **Unified AI Client**: A common interface for making AI calls regardless of the provider.
2. **Model Configuration**: Configuration for different models across providers.
3. **Model Selector**: Helper functions for selecting the appropriate model for different tasks.

## Configuration

### Environment Variables

The following environment variables are used to configure the AI providers:

```
# AI Provider Configuration
AI_PROVIDER=openai  # Options: openai, openrouter
OPENAI_API_KEY=your-openai-api-key
OPENROUTER_API_KEY=your-openrouter-api-key
APP_URL=https://your-app-url.com  # Required for OpenRouter
```

### Model-Specific Environment Variables

You can also configure specific models for different tasks:

```
AI_SUMMARY_MODEL=gpt-3.5-turbo  # Model for summarization
AI_CATEGORY_MODEL=gpt-3.5-turbo  # Model for categorization
AI_ENHANCEMENT_MODEL=gpt-4  # Model for text enhancement
AI_SUGGESTION_MODEL=gpt-4  # Model for suggestions
```

## Usage

### Basic Usage

```typescript
import { callAI } from '@/lib/ai/providers/aiClient';

const response = await callAI({
  prompt: "Summarize the following report...",
  systemPrompt: "You are a helpful assistant...",
  model: "gpt-4",  // Optional: Specify model if needed
  temperature: 0.7,  // Optional: Control randomness
  maxTokens: 100  // Optional: Limit response length
});

console.log(response.content);  // The AI response
console.log(response.meta);  // Metadata about the response (model, tokens, etc.)
```

### Using the Model Selector

```typescript
import { selectModel } from '@/lib/ai/providers/modelSelector';
import { callAI } from '@/lib/ai/providers/aiClient';

// Select the best model for summarization
const model = selectModel({
  task: 'summarization',
  quality: 'medium',
  maxTokens: 100,
  costSensitive: true
});

const response = await callAI({
  prompt: "Summarize the following report...",
  systemPrompt: "You are a helpful assistant...",
  model: model
});
```

## Model Selection

The `selectModel` function helps choose the appropriate model based on the task, quality requirements, and cost sensitivity:

### Tasks

- `summarization`: Summarizing content
- `categorization`: Categorizing content
- `generation`: Generating new content
- `enhancement`: Enhancing existing content
- `general`: General-purpose tasks

### Quality Levels

- `high`: Best quality, typically using the most capable models
- `medium`: Balanced quality and cost
- `low`: Lower quality but more cost-effective

### Cost Sensitivity

Setting `costSensitive: true` will prioritize cheaper models that can still handle the task.

## Adding New Providers

To add a new AI provider:

1. Update the `aiClient.ts` file to include the new provider in the switch statement
2. Implement the provider-specific call function
3. Update the model configuration in `modelConfig.ts`
4. Add the new provider to the environment variables

## Troubleshooting

### Common Issues

1. **API Key Issues**: Ensure the correct API key is set in the environment variables.
2. **Model Not Found**: Check that the model name is correct and available for the selected provider.
3. **Response Parsing Errors**: Ensure the prompt is properly formatted for the expected response structure.

### Logging

All AI calls are logged with detailed information about the request and response. Check the logs for troubleshooting information.

## Future Improvements

- Add support for streaming responses
- Implement caching for common AI requests
- Add more sophisticated model selection based on content analysis
- Support for fine-tuned models
