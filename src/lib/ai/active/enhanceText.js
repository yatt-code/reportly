import logger from '@/lib/utils/logger';
import { callAI } from '@/lib/ai/providers/aiClient';
import { selectModel } from '@/lib/ai/providers/modelSelector';

/**
 * Enhances a piece of text using AI based on the specified enhancement type.
 *
 * @param {string} textToEnhance - The text snippet to enhance.
 * @param {string} enhancementType - The type of enhancement (e.g., 'tone', 'clarity', 'grammar').
 * @returns {Promise<string>} - A promise resolving to the enhanced text.
 */
export async function enhanceText(textToEnhance, enhancementType = 'clarity') {
    const functionName = 'enhanceText';
    logger.log(`[${functionName}] Called`, { textLength: textToEnhance?.length, type: enhancementType });

    if (!textToEnhance) {
        logger.warn(`[${functionName}] Received empty text.`);
        return '';
    }

    try {
        // Select the appropriate model for text enhancement
        const model = process.env.AI_ENHANCEMENT_MODEL || selectModel({
            task: 'enhancement',
            quality: 'medium',
            maxTokens: 200,
            costSensitive: true
        });

        // Create a prompt based on the enhancement type
        let prompt = '';
        let systemPrompt = '';

        switch (enhancementType.toLowerCase()) {
            case 'clarity':
                prompt = `Improve the clarity of the following text while preserving its meaning:\n\n${textToEnhance}`;
                systemPrompt = "You are a writing assistant that improves text clarity. Make the text clearer and more understandable without changing its meaning.";
                break;
            case 'tone':
                prompt = `Adjust the tone of the following text to be more professional and engaging:\n\n${textToEnhance}`;
                systemPrompt = "You are a writing assistant that improves text tone. Make the text more professional and engaging without changing its meaning.";
                break;
            case 'grammar':
                prompt = `Fix any grammar or spelling issues in the following text:\n\n${textToEnhance}`;
                systemPrompt = "You are a writing assistant that corrects grammar and spelling. Fix any errors without changing the meaning of the text.";
                break;
            case 'conciseness':
                prompt = `Make the following text more concise without losing important information:\n\n${textToEnhance}`;
                systemPrompt = "You are a writing assistant that makes text more concise. Remove unnecessary words and phrases without losing important information.";
                break;
            default:
                prompt = `Improve the following text:\n\n${textToEnhance}`;
                systemPrompt = "You are a writing assistant that improves text quality. Enhance the text while preserving its meaning.";
        }

        // Call the AI with our unified interface
        const response = await callAI({
            prompt,
            systemPrompt,
            model,
            temperature: 0.4,
            maxTokens: Math.max(100, textToEnhance.length * 1.5) // Allow for some expansion
        });

        const enhancedText = response.content.trim();

        logger.log(`[${functionName}] Successfully enhanced text.`, {
            originalLength: textToEnhance.length,
            enhancedLength: enhancedText.length,
            model: response.meta.modelUsed
        });

        return enhancedText;
    } catch (error) {
        logger.error(`[${functionName}] Failed to enhance text:`, error);
        // Return the original text if enhancement fails
        return textToEnhance;
    }
}

// Note: This function isn't directly called by the initial scaffolding
// of generateSuggestions, which returns hardcoded suggestions.
// This is here as a placeholder for future, more granular AI calls.