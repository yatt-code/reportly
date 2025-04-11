# 📘 Project Overview: Reportly

## Introduction

Reportly is a full-stack SaaS application designed to streamline the process of creating, managing, and collaborating on reports. It provides a rich text editing experience with AI-powered assistance, a comprehensive commenting system, and gamification elements to encourage user engagement.

## Core Features

1. **Rich Text Editor**
   - Markdown-based editing with TipTap
   - Inline image upload (drag and drop)
   - Attachment support (PDF & media)
   - Mermaid.js diagram support
   - Code blocks with syntax highlighting
   - Auto-save draft functionality

2. **Dashboard**
   - Statistics and productivity summaries
   - Daily report streak tracking
   - Latest report list with AI-generated labels
   - Weekly activity heatmap

3. **User Management & RBAC**
   - User registration and authentication
   - Role-based access control
   - Achievement system
   - Project assignment

4. **Social Interactions**
   - Threaded commenting system
   - @Mention functionality
   - Notification system
   - Group-based collaboration
   - Achievement-based gamification

5. **AI Integration**
   - Report summarization and categorization
   - Content linking and clustering
   - Weekly report generation
   - AI-assisted editing
   - Auto-tagging and summarization

## AI Functionality

| **AI Function**       | **Trigger**         | **Purpose**                                   | **Output**                                   |
|------------------------|---------------------|-----------------------------------------------|---------------------------------------------|
| `summarizeReport()`    | On Save            | Create short summary of content               | 1-2 sentence TL;DR                          |
| `categorizeReport()`   | On Save            | Assign tags/topics                            | e.g., ['bug', 'feature', 'internal']        |
| `clusterReports()`     | Daily cron job     | See which reports are on the same project     | Clustered by vector similarity              |
| `generateWeeklySummary()` | Weekly cron job | Create team digest                            | List of report highlights per team          |
| `aiAssistInEditor()`   | Button click / realtime | Help rephrase, expand, correct grammar     | Text suggestion or inline help              |

### AI Modes

| **Mode**   | **Example**         | **User Trigger** | **When to Use**              |
|------------|---------------------|------------------|------------------------------|
| Passive    | Auto-summarize      | None (automated) | Always-on insight generation |
| Active     | Rephrase paragraph  | User clicks      | On-demand AI help            |

## Multi-tenant Architecture

Reportly implements a multi-tenant architecture with Organizations and Workspaces:

- **Organizations**: Top-level entities that represent companies or teams
- **Workspaces**: Sub-entities within organizations for project-specific collaboration
- **Access Control**: Fine-grained permissions at the workspace level
- **Data Isolation**: Reports and comments are scoped to specific workspaces

## Target Users

1. **Development Teams**: For daily standups, bug reports, and feature updates
2. **Project Managers**: For tracking team progress and generating summaries
3. **Technical Writers**: For creating and collaborating on documentation
4. **Support Teams**: For documenting customer issues and solutions

## Business Value

- **Increased Productivity**: Streamlined report creation and collaboration
- **Better Knowledge Sharing**: Centralized repository of team knowledge
- **Enhanced Collaboration**: Social features for team interaction
- **Actionable Insights**: AI-powered summaries and categorization
- **Engagement Incentives**: Gamification to encourage regular reporting
