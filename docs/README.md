# 📚 Reportly Documentation

Welcome to the Reportly documentation. This repository contains comprehensive documentation for the Reportly project, a full-stack SaaS application for creating, managing, and collaborating on reports.

## 📋 Table of Contents

### � Getting Started
- [Quick Start Guide](quick-start.md) - Concise guide to get up and running quickly
- [Getting Started Guide](getting-started.md) - Comprehensive setup and installation guide
- [Setup Guide with Diagrams](project/setup-guide.md) - Visual guide to system architecture and setup
- [Contributing Guide](CONTRIBUTING.md) - Guidelines for contributing to documentation

### 📘 Project Overview
- [Project Overview](project/overview.md) - High-level description of the Reportly project
- [Technical Architecture](project/architecture.md) - System architecture and design
- [Technology Stack](project/stack.md) - Technologies used in the project
- [AI Collaboration](project/ai-collaboration.md) - AI agents and tools used in development

### 🧭 Milestones
- [Milestone 1: Foundation & Database](milestones/m1-foundation.md) - Core infrastructure and database integration
- [Milestone 2: Editor & AI Layer](milestones/m2-editor-ai.md) - Rich text editor and AI integration
- [Milestone 3: Authentication & Management](milestones/m3-auth-management.md) - User authentication and management
- [Milestone 4: Comment System](milestones/m4-comment-system.md) - Threaded commenting functionality
- [Milestone 5: Gamification](milestones/m5-gamification.md) - XP, levels, and achievements
- [Milestone 6: QA & Final Touches](milestones/m6-qa-final.md) - Quality assurance and final improvements
- [Milestone 7: Mentions & Notifications](milestones/m7-mentions-notifications.md) - @mentions and notification system
- [Milestone 8: Organizations & Workspaces](milestones/m8-orgs-workspace.md) - Multi-tenant architecture

### 🧠 Technical Specifications
- [Authentication Flow](specifications/auth/auth-flow.md) - User authentication process
- [RBAC Rules](specifications/auth/rbac-rules.md) - Role-based access control
- [Editor](specifications/editor/editor.md) - Rich text editor implementation
- [AI Suggestion Panel](specifications/editor/ai-suggestion-panel.md) - AI-powered content suggestions
- [Comment System](specifications/social/comment-system.md) - Threaded commenting functionality
- [Mentions](specifications/social/mentions.md) - @mention system
- [Notifications](specifications/social/notifications.md) - User notification system
- [Dashboard](specifications/ui/dashboard.md) - User dashboard design and functionality
- [Report Container](specifications/reports/report-container.md) - Report display and management
- [Report Ownership](specifications/reports/report-ownership.md) - Report access control
- [Gamification](specifications/gamification/gamification.md) - Achievement and XP system
- [XP & Levels](specifications/gamification/xp-level.md) - Experience points and user levels
- [Workspaces](specifications/organization/workspace.md) - Multi-tenant workspace implementation

### 📝 Implementation Details
- [Authentication & RBAC](implementation/changes/auth-rbac.md) - Authentication implementation details
- [Backend Architecture](implementation/changes/backend-architecture.md) - Backend implementation details
- [Comment System](implementation/changes/comment-system.md) - Comment system implementation
- [Frontend](implementation/changes/frontend.md) - Frontend implementation details
- [Gamification](implementation/changes/gamification.md) - Gamification implementation details
- [Notifications](implementation/changes/notifications.md) - Notification system implementation
- [Organizations & Workspaces](implementation/changes/orgs-workspace.md) - Multi-tenant implementation details
- [XP & Levels](implementation/changes/xp-level.md) - XP system implementation details

### 🧪 Testing
- [Manual Tests](testing/manual-tests/README.md) - Manual testing procedures
- [Performance Tests](testing/performance-tests/README.md) - Performance testing plans
- [Accessibility Tests](testing/accessibility-tests/README.md) - Accessibility testing plans
- [QA Tests](implementation/changes/qa-tests.md) - Quality assurance testing results

## 🗂️ Document Map

This section organizes documentation by feature area, making it easier to find all documents related to a specific feature.

### Authentication & Authorization
- [Technical Specification: Authentication Flow](specifications/auth/auth-flow.md)
- [Technical Specification: RBAC Rules](specifications/auth/rbac-rules.md)
- [Implementation: Authentication & RBAC](implementation/changes/auth-rbac.md)
- [Manual Tests: Auth & RBAC](testing/manual-tests/auth/auth-rbac-tests.md)

### Editor & AI
- [Technical Specification: Editor](specifications/editor/editor.md)
- [Technical Specification: AI Suggestion Panel](specifications/editor/ai-suggestion-panel.md)
- [Implementation: Frontend](implementation/changes/frontend.md)
- [Manual Tests: Editor](testing/manual-tests/editor/editor-tests.md)
- [Manual Tests: AI Suggestions](testing/manual-tests/editor/ai-suggestion-tests.md)

### Social Features
- [Technical Specification: Comment System](specifications/social/comment-system.md)
- [Technical Specification: Mentions](specifications/social/mentions.md)
- [Technical Specification: Notifications](specifications/social/notifications.md)
- [Implementation: Comment System](implementation/changes/comment-system.md)
- [Implementation: Notifications](implementation/changes/notifications.md)
- [Manual Tests: Comments & Mentions](testing/manual-tests/social/comment-mention-tests.md)
- [Manual Tests: Notifications](testing/manual-tests/social/notification-tests.md)

### Gamification
- [Technical Specification: Gamification](specifications/gamification/gamification.md)
- [Technical Specification: XP & Levels](specifications/gamification/xp-level.md)
- [Implementation: Gamification](implementation/changes/gamification.md)
- [Implementation: XP & Levels](implementation/changes/xp-level.md)
- [Manual Tests: Gamification](testing/manual-tests/gamification/gamification-tests.md)

### Organizations & Workspaces
- [Technical Specification: Workspaces](specifications/organization/workspace.md)
- [Implementation: Organizations & Workspaces](implementation/changes/orgs-workspace.md)
- [Manual Tests: Organization & Workspace](testing/manual-tests/organization-workspace-tests.md)
- [Performance Tests: Organization & Workspace](testing/performance-tests/organization-workspace-performance.md)
- [Accessibility Tests: Organization & Workspace](testing/accessibility-tests/organization-workspace-accessibility.md)

### UI Components
- [Technical Specification: Dashboard](specifications/ui/dashboard.md)
- [Technical Specification: Report Container](specifications/reports/report-container.md)
- [Technical Specification: Report Ownership](specifications/reports/report-ownership.md)
- [Manual Tests: Dashboard](testing/manual-tests/ui/dashboard-tests.md)
- [Manual Tests: Theme](testing/manual-tests/ui/theme-tests.md)

## 🔄 Documentation Conventions

### Document Types
- **📘 Project Overview** - High-level project information
- **🧭 Milestone** - Project milestone documentation
- **🧠 Mini-Spec** - Technical specification for a feature or component
- **📝 Change Summary** - Implementation details and changes
- **🧪 Test Script** - Testing procedures and plans

### Formatting
- All documentation is written in Markdown
- Use headings (##, ###) for section organization
- Include emojis for visual categorization
- Use tables for structured information
- Include code blocks with appropriate language tags

## 🔄 Contributing to Documentation

When contributing to the documentation:

1. Follow the established folder structure
2. Use the appropriate document type label
3. Maintain consistent formatting
4. Update the main README.md if adding new documents
5. Cross-reference related documents

## 📅 Last Updated

This documentation index was last updated on: April 11, 2025


