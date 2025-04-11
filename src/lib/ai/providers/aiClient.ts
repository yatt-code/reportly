import 'openai/shims/node';
import { OpenAI } from "openai";
import axios from "axios";
import logger from '@/lib/utils/logger';
import { mapOpenAIToOpenRouter } from './modelConfig';

/**
 * The AI provider to use, defaulting to OpenAI if not specified
 */
const PROVIDER = process.env.AI_PROVIDER ?? "openai";

/**
 * Interface for AI message structure
 */
interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Interface for AI call options
 */
interface AICallOptions {
  prompt: string;
  systemPrompt?: string;
  temperature?: number;
  model?: string;
  maxTokens?: number;
}

/**
 * Interface for AI response metadata
 */
interface AIResponseMeta {
  modelUsed: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  cost?: number;
}

/**
 * Interface for AI response
 */
interface AIResponse {
  content: string;
  meta: AIResponseMeta;
}

/**
 * Unified AI client for making calls to different AI providers
 *
 * @param options - Options for the AI call
 * @returns Promise with the AI response content and metadata
 */
export async function callAI({
  prompt,
  systemPrompt = "",
  temperature = 0.7,
  model = "gpt-4o-mini",
  maxTokens
}: AICallOptions): Promise<AIResponse> {
  const functionName = 'callAI';
  logger.log(`[${functionName}] Starting AI call with provider: ${PROVIDER}`, { model });

  const messages: AIMessage[] = [
    { role: "system", content: systemPrompt },
    { role: "user", content: prompt }
  ];

  try {
    switch (PROVIDER) {
      case "openai":
        return await callOpenAI(messages, temperature, model, maxTokens);
      case "openrouter":
        return await callOpenRouter(messages, temperature, model, maxTokens);
      default:
        throw new Error(`Unsupported AI provider: ${PROVIDER}`);
    }
  } catch (error) {
    logger.error(`[${functionName}] AI call failed`, error);
    throw error instanceof Error ? error : new Error(`AI call failed: ${error}`);
  }
}

/**
 * Call OpenAI API
 *
 * @param messages - Array of messages to send to OpenAI
 * @param temperature - Temperature parameter for controlling randomness
 * @param model - Model to use
 * @param maxTokens - Maximum tokens to generate
 * @returns Promise with the AI response content and metadata
 */
async function callOpenAI(
  messages: AIMessage[],
  temperature: number,
  model: string,
  maxTokens?: number
): Promise<AIResponse> {
  const functionName = 'callOpenAI';
  logger.log(`[${functionName}] Calling OpenAI API`, { model, temperature });

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const response = await openai.chat.completions.create({
      model,
      messages,
      temperature,
      max_tokens: maxTokens
    });

    const content = response.choices[0].message.content || '';

    const meta: AIResponseMeta = {
      modelUsed: model,
      promptTokens: response.usage?.prompt_tokens,
      completionTokens: response.usage?.completion_tokens,
      totalTokens: response.usage?.total_tokens,
      // Approximate cost calculation could be added here
    };

    logger.log(`[${functionName}] OpenAI call successful`, {
      contentLength: content.length,
      tokens: meta.totalTokens
    });

    return { content, meta };
  } catch (error) {
    logger.error(`[${functionName}] OpenAI call failed`, error);
    throw error;
  }
}

/**
 * Call OpenRouter API
 *
 * @param messages - Array of messages to send to OpenRouter
 * @param temperature - Temperature parameter for controlling randomness
 * @param model - Model to use
 * @param maxTokens - Maximum tokens to generate
 * @returns Promise with the AI response content and metadata
 */
async function callOpenRouter(
  messages: AIMessage[],
  temperature: number,
  model: string,
  maxTokens?: number
): Promise<AIResponse> {
  const functionName = 'callOpenRouter';
  logger.log(`[${functionName}] Calling OpenRouter API`, { model, temperature });

  try {
    // Map OpenAI model names to OpenRouter model names if needed
    const mappedModel = mapModelToOpenRouter(model);

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: mappedModel,
        messages,
        temperature,
        max_tokens: maxTokens
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "HTTP-Referer": process.env.APP_URL || "http://localhost:3000",
          "X-Title": "Reportly AI Assistant",
        },
      }
    );

    const content = response.data.choices[0].message.content || '';

    const meta: AIResponseMeta = {
      modelUsed: mappedModel,
      promptTokens: response.data.usage?.prompt_tokens,
      completionTokens: response.data.usage?.completion_tokens,
      totalTokens: response.data.usage?.total_tokens,
      cost: response.data.usage?.cost
    };

    logger.log(`[${functionName}] OpenRouter call successful`, {
      contentLength: content.length,
      tokens: meta.totalTokens,
      cost: meta.cost
    });

    return { content, meta };
  } catch (error) {
    logger.error(`[${functionName}] OpenRouter call failed`, error);
    throw error;
  }
}

/**
 * Map OpenAI model names to OpenRouter model names
 *
 * @param model - OpenAI model name
 * @returns OpenRouter model name
 */
function mapModelToOpenRouter(model: string): string {
  return mapOpenAIToOpenRouter(model);
}
