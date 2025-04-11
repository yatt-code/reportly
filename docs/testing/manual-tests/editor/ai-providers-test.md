# 🧪 Manual Test Script: AI Provider Integration

This document outlines manual tests to verify the OpenRouter integration with the Reportly application.

## Prerequisites

1. Ensure you have valid API keys for both OpenAI and OpenRouter
2. Set up your `.env` file with the following variables:
   ```
   AI_PROVIDER=openai  # Will be changed during testing
   OPENAI_API_KEY=your-openai-api-key
   OPENROUTER_API_KEY=your-openrouter-api-key
   APP_URL=http://localhost:3000  # Required for OpenRouter
   ```

## Test Cases

### 1. Report Creation with AI Summary and Tags

#### Test with OpenAI
1. Set `AI_PROVIDER=openai` in your `.env` file
2. Restart the application
3. Log in to the application
4. Create a new report with substantial content (at least 2-3 paragraphs)
5. Save the report
6. Verify that an AI-generated summary appears
7. Verify that AI-generated tags are assigned to the report
8. Check the logs to confirm OpenAI was used

#### Test with OpenRouter
1. Set `AI_PROVIDER=openrouter` in your `.env` file
2. Restart the application
3. Repeat steps 3-7 from the OpenAI test
4. Check the logs to confirm OpenRouter was used
5. Compare the quality and response time with OpenAI

### 2. AI Suggestion Panel

#### Test with OpenAI
1. Set `AI_PROVIDER=openai` in your `.env` file
2. Restart the application
3. Open an existing report in edit mode
4. Write or edit content to trigger suggestions
5. Verify that AI suggestions appear in the suggestion panel
6. Accept a suggestion and verify it's applied correctly
7. Check the logs to confirm OpenAI was used

#### Test with OpenRouter
1. Set `AI_PROVIDER=openrouter` in your `.env` file
2. Restart the application
3. Repeat steps 3-6 from the OpenAI test
4. Check the logs to confirm OpenRouter was used
5. Compare the quality and response time with OpenAI

### 3. Text Enhancement

#### Test with OpenAI
1. Set `AI_PROVIDER=openai` in your `.env` file
2. Restart the application
3. Open an existing report in edit mode
4. Select a paragraph and use the "Enhance Text" feature
5. Verify that the text is enhanced appropriately
6. Check the logs to confirm OpenAI was used

#### Test with OpenRouter
1. Set `AI_PROVIDER=openrouter` in your `.env` file
2. Restart the application
3. Repeat steps 3-5 from the OpenAI test
4. Check the logs to confirm OpenRouter was used
5. Compare the quality and response time with OpenAI

### 4. Error Handling

#### Test API Key Errors
1. Set `AI_PROVIDER=openai` in your `.env` file
2. Deliberately set an invalid OpenAI API key
3. Restart the application
4. Attempt to create a report or generate suggestions
5. Verify that the application handles the error gracefully
6. Repeat with `AI_PROVIDER=openrouter` and an invalid OpenRouter API key

#### Test Network Errors
1. Disconnect from the internet
2. Attempt to create a report or generate suggestions
3. Verify that the application handles the network error gracefully
4. Reconnect to the internet and verify functionality returns

## Test Results

Document your findings in the following format:

### Test Case: [Test Name]
- **Provider**: [OpenAI/OpenRouter]
- **Result**: [Pass/Fail]
- **Response Time**: [Time in seconds]
- **Quality Assessment**: [1-5 rating with notes]
- **Issues Observed**: [Any issues or unexpected behavior]
- **Screenshots**: [If applicable]

## Comparison Summary

After completing all tests, provide a comparison summary:

1. **Response Time**: Which provider was faster on average?
2. **Quality**: Which provider produced better quality results?
3. **Reliability**: Were there any reliability issues with either provider?
4. **Cost**: Based on the token usage, which provider would be more cost-effective?
5. **Recommendation**: Which provider would you recommend for production use?
