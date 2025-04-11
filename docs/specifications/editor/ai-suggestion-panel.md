# AI Suggestion Panel Mini-Spec

## 🧠 Overview

### Objective
To build an AI-powered Suggestion Panel that offers contextual assistance while a user is writing or editing a report. Suggestions may include:
- Grammar fixes
- Tone improvements
- Content enrichment
- Structural rewrites

This feature is similar to GitHub Copilot but tailored for business/report writing.

---

## 🧩 Component Details

### Component Name
**AiSuggestionPanel**

### Location in UI
The panel will be displayed:
- As a side drawer (right-aligned)
- Or as an inline popup near selected text (v2 scope)

---

## 🔍 Core Features (MVP)

| **Feature**       | **Description**                                                                 |
|--------------------|---------------------------------------------------------------------------------|
| **Context Analysis**   | Capture current report content or selection                                    |
| **Passive AI**         | Call `generateSummary`, `categorizeReport`, etc., to enhance context            |
| **Suggestions List**   | Show AI-generated text snippets or transformations                            |
| **Accept/Insert**      | Allow users to click and inject suggestions into the editor                     |
| **Dismiss**            | Remove unwanted suggestions                                                   |
| **Regenerate**         | Request alternative suggestions from the AI                                   |

---

## 🧱 Data Flow

```mermaid
User types/edit
    ↓
Passive AI triggers (on debounce or manual)
    ↓
Server Action: generateSuggestions()
    ↓
Returns array of suggestions [
  { type: 'rewording', title: 'Clearer phrasing', suggestion: '...text...' },
  ...
]
    ↓
Displayed in <AiSuggestionPanel />
```

---

## 📡 Backend Integration

- **Endpoint**: `app/report/actions/generateSuggestions.js`
- **Pipeline**: Calls Active AI pipeline (`lib/ai/active/enhanceText.js`)
- **Input**: Current paragraph/section
- **Output**: Array of suggestion objects (e.g., `{ type, title, suggestion }`)

---

## 🧪 Example Suggestion Object

```ts
{
  type: "tone",
  title: "More persuasive tone",
  suggestion: "This solution guarantees measurable ROI within 30 days."
}
```

---

## 🧰 Technical Requirements

- Add `AiSuggestionPanel.tsx` component (side panel layout)
- Handle loading, empty, and error states
- Integrate with TipTap Editor context or state
- Backend call: `/actions/generateSuggestions`
- Accept button inserts text into the current editor selection (use TipTap commands)

---

## 🚀 Stretch Goals (Post-MVP)

- Inline suggestion popup (hover or cursor-based)
- Suggestions based on tone/style goals (e.g., “make this concise”)
- Realtime suggestions while typing (with debounce + cooldown)
- Suggest Mermaid diagrams based on content patterns

---

## 🧭 Next Steps

1. Scaffold UI: Create base `AiSuggestionPanel` with mocked data
2. Build `generateSuggestions` server action (mocked response first)
3. Connect it to TipTap editor and allow inserting text
4. Hook up actual AI logic via OpenAI API (Active AI)