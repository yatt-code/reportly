# Report Page Container Mini-Spec

---

## 📘 Mini-Spec: ReportPageContainer

### 🎯 Goal

Create a page-level React component that wraps the `TipTapEditor` and handles:

- Loading report data (by ID)
- Switching between read-only and editable modes
- Preparing and displaying AI Suggestions (if available)
- Submitting edits back to the server

---

## 🗂️ Suggested File Structure

- **Main File**: `app/(report)/report/[id]/page.tsx` (Next.js App Router)
- **Supporting Files**:
    - `components/report/ReportPageContainer.tsx`
    - `hooks/useFetchReport.ts`
    - `lib/ai/fetchSuggestions.ts` (can be mocked)

---

## 🧩 Component Props

```typescript
interface ReportPageContainerProps {
    reportId: string;
    editable?: boolean; // query param or logic from route
}
```

---

## 🧠 Functional Behavior

### 1. Fetch Report by ID
- Use `useFetchReport(reportId)` or a server-side fetch if needed.
- Display a loading spinner during fetch.
- On error: show a fallback (404 or error page).

### 2. Mode Handling
- Determine if the user is in editable mode.
- Pass this down to the `TipTapEditor` via the `editable` prop.

### 3. AI Suggestions
- Fetch suggestions from the `AiSuggestion` model (stub/mock if needed).
- Display suggestions in a sidebar or below the editor (can be hidden/expandable).
- Suggestions may include improvement tips, style tweaks, next sentence continuation, etc.

### 4. Save Handling
- Connect `onSave` from `TipTapEditor` to `saveReport()` server action.
- Display a simple toast or success state on save.

### 5. UI/UX
- Show the report title (editable or read-only).
- Include breadcrumbs or a "Back to Dashboard" link.
- Provide an “Edit” or “Save Changes” button depending on the mode.
- Ensure dark mode compatibility.

---

## 🔌 Backend Interaction Points

- `lib/db/models/Report.ts`
- `app/report/actions/saveReport.ts`
- `lib/ai/passive/generateSummary.ts` (used post-save for AI enrichments)
- `lib/ai/active/fetchSuggestions.ts` (stub/mock responses if needed)

---

## 📦 Output Summary

| File                  | Purpose                                   |
|-----------------------|-------------------------------------------|
| `page.tsx`            | Top-level route handling + SSR if needed |
| `ReportPageContainer.tsx` | Handles all business logic              |
| `useFetchReport.ts`   | Custom hook for fetching a single report |
| `fetchSuggestions.ts` | Mock/stub AI suggestion fetch logic      |

---

## 🧪 Stretch Goals (Optional)

- Add optimistic UI during saving.
- Detect unsaved changes (dirty state).
- Support report version history (future-proofing).
- Hook in AI “Auto Suggest Next Sentence” (active AI).

---
