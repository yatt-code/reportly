# 🧭 Mini-Spec: M2 – AI-Enhanced Report Editing & Suggestion Layer

---

## 🎯 Objective

Elevate report writing with AI-powered features, including real-time suggestions, intelligent passive AI pipelines, and modular action handling for a seamless user experience.

---

## 📦 Core Features

| Feature | Description | Implementation |
|---------|-------------|-----------------|
| Tiptap Editor | Advanced rich-text editor with Markdown support and inline enhancements | `TiptapEditor.tsx` |
| AI Suggestion Panel | Dynamic display of context-aware AI-generated suggestions during editing | `AISuggestionPanel.tsx` |
| Suggestion Handling | Server-side action for applying accepted AI suggestions | `handleAcceptSuggestion` |
| Passive AI Pipeline | Automated AI processing during report drafting and saving | `lib/ai/passive/` |
| Smart Trigger Logic | Conditional AI invocation based on user interaction and save state | Integrated throughout |

---

## 🧠 Passive AI Pipeline

Implemented in `lib/ai/passive/`:
1. `generateSummary(content)`: Creates concise report summaries
2. `categorizeReport(content)`: Assigns relevant tags and categories
3. `enhanceText(content)`: Improves overall text quality and readability

These functions are orchestrated in the `saveReport` action for comprehensive AI processing.

---

## 🛠️ Server Actions

| Action | Description | Implementation |
|--------|-------------|-----------------|
| `saveReport(reportData)` | Processes report input through the AI pipeline and saves to MongoDB | Server-side action |
| `handleAcceptSuggestion(suggestion)` | Integrates accepted AI suggestions into the report | Server-side action |
| `getSuggestions(reportId)` | Retrieves stored AI suggestions (future enhancement) | Server-side action |

---

## 💻 Frontend Components

| Component | Purpose | Key Features |
|-----------|---------|--------------|
| `TiptapEditor.tsx` | Main editing interface | Change tracking, AI integration |
| `AISuggestionPanel.tsx` | Displays AI suggestions | Real-time updates, user interaction |
| `SuggestionItem.tsx` | Individual suggestion UI | Accept/reject functionality |

---

## ✅ Acceptance Criteria

1. [ ] Seamless report editing with Tiptap Editor
2. [ ] Real-time AI-generated suggestions and enhancements
3. [ ] Intuitive rendering of AI suggestions during editing
4. [ ] User-friendly acceptance and application of suggestions
5. [ ] Optional persistence of suggestions alongside reports

---

## 🔐 Access Control

| Action | Permission | Notes |
|--------|------------|-------|
| Save & edit report | Authenticated users with report access | Ensures data integrity |
| Accept suggestions | Same as editing permissions | Maintains consistency |

---

## 📅 Estimated Timeline

| Task | Duration | Priority |
|------|----------|----------|
| Editor integration | 1.5 days | High |
| Passive AI pipeline | 0.5 day | Medium |
| Suggestion panel UI | 1 day | High |
| Server action hooks | 0.5 day | Medium |

Total Estimated Time: 3.5 days

---

**Status:** ✅ Complete

**Next Steps:** 
1. Conduct thorough testing of the integrated AI features
2. Gather user feedback on the suggestion system
3. Optimize AI response times and accuracy
4. Explore advanced AI capabilities for future iterations
