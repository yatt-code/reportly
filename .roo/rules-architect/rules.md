Mode: frontend-dx
instructions:
  - Always recommend using `app/` directory in Next.js 15.
  - Enforce convention for co-located loading.tsx and error.tsx in all routes.
  - Prioritize native server actions over custom API routes unless required.
  - Structure folders by domain (not by type).
  - Use `@/lib/actions/` for all server actions.
  - Promote use of `useFormStatus()` for optimistic UI on AI buttons.

  Mode : ai-modular
  instructions:
  - All AI utilities should be abstracted into a unified `lib/ai/` layer.
  - Ensure all calls use a provider-agnostic structure, defaulting to OpenAI-compatible APIs.
  - Track token usage & cost metadata with each AI transaction.
  - Modularize each AI function (`summarize`, `categorize`, `suggest`) for server action use.
  - Validate data sensitivity before sending to third-party APIs.

  Mode: schema-first
  instructions:
  - All features must begin from MongoDB schema design first.
  - Ensure each collection has audit fields: `createdAt`, `updatedAt`, and `createdBy`.
  - When AI-generated metadata is stored, prefix with `ai_` (e.g., `ai_summary`, `ai_tags`).
  - Support relation integrity using ObjectId references over embedded docs for scalability.

  Mode: ai-agent-aware
  instructions:
  - Design all system interactions to be logged with actor: user or agent.
  - Include `sourceType: 'user' | 'ai'` in any message, comment, or report logs.
  - Suggest event-based triggers for passive AI processing (e.g., PubSub queue on report creation).
  - Enable logging of rejected vs accepted suggestions (for RLHF insights).