# 🧭 Mini-Spec: M1 – Report Foundation & Database Integration

## 🎯 Objective

Establish a robust foundational infrastructure for efficient report management, secure database storage, and intelligent passive AI interaction.

## 📦 Core Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Report Schema | Comprehensive MongoDB schema for reports with essential fields | High |
| Server Actions | Secure and efficient CRUD operations for report management | High |
| Passive AI Hook | Intelligent summary generation using `generateSummary()` | Medium |
| Project Structure | Scalable and modular directory and file structure | High |
| Editor Integration | Seamless binding of editor content to report save API | Medium |

## 🧱 Report Schema Fields

```typescript
interface ReportSchema {
  _id: ObjectId;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  groupId?: string;
  summary?: string; // AI-generated summary
  tags?: string[]; // AI-generated tags
}
```

## 🛠️ Server Actions

1. `saveReport(reportData: Partial<ReportSchema>): Promise<ReportSchema>`
   - Saves new or updates existing report
   - Triggers passive AI pipeline for summary and tag generation
   - Returns the saved report object

2. `getReports(filter: { userId?: string, groupId?: string }): Promise<ReportSchema[]>`
   - Retrieves list of reports based on user or group access scope
   - Implements pagination for efficient data loading

3. `getReportById(id: string): Promise<ReportSchema | null>`
   - Fetches full content of a report by its ID
   - Returns null if report not found or user lacks access

## 🤖 Passive AI Integration

- Implement `generateSummary(content: string): Promise<string>` function
- Integrate with `saveReport` action to automatically generate summaries
- Implement `generateTags(content: string): Promise<string[]>` for intelligent tagging
- Store AI-generated data in the report schema for quick access

## ✅ Acceptance Criteria

- [ ] Reports are successfully saved to and retrieved from MongoDB
- [ ] User-based and group-based report filtering is implemented and tested
- [ ] Passive AI summary and tag generation works for new and updated report content
- [ ] Project folder structure is modular, scalable, and follows best practices
- [ ] Server actions are secure, properly authenticated, and access-scoped
- [ ] Editor content is correctly bound to the report save API
- [ ] All CRUD operations are thoroughly tested with various scenarios

## 🔐 Access Control

| Action | Permission | Implementation |
|--------|------------|-----------------|
| Save report | Logged-in users | Middleware authentication check |
| Fetch own reports | Logged-in users | Filter by `userId` in query |
| Group reports | `user.groupId === report.groupId` | Additional access check in query |

## 📅 Estimate

| Task | Duration | Dependencies |
|------|----------|--------------|
| MongoDB model & connection setup | 0.5 day | None |
| Server actions (CRUD) implementation | 1 day | MongoDB setup |
| Passive AI integration | 0.5 day | Server actions |
| Editor binding & testing | 1 day | Server actions |
| Security & access control implementation | 0.5 day | All above tasks |
| Testing & documentation | 0.5 day | All above tasks |

**Total Estimated Time:** 4 days

## 🧪 Testing Strategy

- Unit tests for each server action
- Integration tests for database operations
- End-to-end tests for editor integration
- Security tests for access control

## 📚 Documentation

- API documentation for server actions
- Database schema documentation
- Setup guide for local development

**Status:** ✅ Complete

## 🚀 Next Steps

- Implement real-time collaboration features
- Enhance AI capabilities with more advanced NLP tasks
- Develop a user interface for managing reports
