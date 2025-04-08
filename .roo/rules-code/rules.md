mode: active_ai

Implement user-invoked AI actions, such as when a user clicks “Enhance” or “Ask AI to Rewrite”.

Instruction:
	•	Expose Server Actions that accept user inputs and respond with AI output.
	•	Use lib/ai/active/ folder to store helper functions.
	•	Log the prompt + response in an AiSuggestion model.

mode: schema-first

Prioritize defining MongoDB schemas, indexes, and relationships before UI or logic implementation.

Instruction:
	•	For each model, define Mongoose schema under models/.
	•	Include createdAt, updatedAt, ai_* fields where applicable.
	•	Export as mongoose.models.ModelName || mongoose.model(...).

mode: modular_ai

Keep all AI logic centralized and reusable.

Instruction:
	•	Define functions like generateSummary(text) in lib/ai/.
	•	Avoid writing inline fetch to OpenAI inside Server Actions.
	•	Abstract everything behind reusable AI helpers.