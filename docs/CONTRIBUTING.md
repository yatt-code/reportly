# 📝 Contributing to Reportly Documentation

This guide outlines the standards and processes for contributing to the Reportly documentation. Following these guidelines ensures consistency and quality across all documentation.

## 📋 Table of Contents

- [Documentation Types](#documentation-types)
- [File Organization](#file-organization)
- [Formatting Standards](#formatting-standards)
- [Emoji Usage Guide](#emoji-usage-guide)
- [Review Process](#review-process)
- [Best Practices](#best-practices)

## Documentation Types

### 📘 Project Overview
- **Purpose**: High-level project information for stakeholders and new team members
- **When to Create**: When introducing new major features or updating project direction
- **Location**: `/docs/project/`
- **Example**: `overview.md`, `architecture.md`, `stack.md`

### 🧭 Milestone
- **Purpose**: Document project milestones, goals, and progress
- **When to Create**: At the beginning of each milestone
- **Location**: `/docs/milestones/`
- **Example**: `m1-foundation.md`, `m2-editor-ai.md`

### 🧠 Technical Specification
- **Purpose**: Detailed technical design for a feature or component
- **When to Create**: Before implementing a new feature or significant change
- **Location**: `/docs/specifications/{category}/`
- **Example**: `auth-flow.md`, `gamification.md`

### 📝 Change Summary
- **Purpose**: Document implementation details and changes
- **When to Create**: After implementing a feature or making significant changes
- **Location**: `/docs/implementation/changes/`
- **Example**: `auth-rbac.md`, `gamification.md`

### 🧪 Test Script
- **Purpose**: Document testing procedures and plans
- **When to Create**: Before testing a new feature
- **Location**: `/docs/testing/{test-type}/`
- **Example**: `auth-rbac-tests.md`, `gamification-tests.md`

### 📋 Decision Record
- **Purpose**: Document important architectural decisions
- **When to Create**: When making significant architectural decisions
- **Location**: `/docs/decisions/`
- **Example**: `001-use-mongodb.md`, `002-auth-strategy.md`

## File Organization

### What Belongs in `/specifications/`
- Technical designs and specifications
- Feature requirements and constraints
- API definitions and interfaces
- Data models and schemas
- Algorithms and business logic

### What Belongs in `/implementation/`
- Implementation details and approaches
- Code structure and organization
- Integration points with other components
- Challenges encountered and solutions
- Performance considerations

### What Belongs in `/testing/`
- Test plans and procedures
- Test cases and scenarios
- Testing tools and environments
- Expected results and acceptance criteria
- Performance and accessibility testing

## Formatting Standards

### Document Structure
1. **Title**: Start with emoji + document type + descriptive title
2. **Overview**: Brief introduction to the document's purpose
3. **Main Content**: Organized into logical sections with clear headings
4. **Conclusion/Summary**: Wrap up with key points or next steps

### Markdown Guidelines
- Use `#` for document title
- Use `##` for main sections
- Use `###` for subsections
- Use `####` for sub-subsections
- Use bullet points (`-`) for unordered lists
- Use numbered lists (`1.`) for sequential steps
- Use code blocks with language specification (```javascript)
- Use tables for structured information

## Emoji Usage Guide

### Document Type Indicators
- 📘 Project Overview
- 🧭 Milestone
- 🧠 Technical Specification
- 📝 Change Summary
- 🧪 Test Script
- 📋 Decision Record

### Section Indicators
- 🎯 Objective/Goal
- 📦 Features/Components
- 🛠️ Implementation
- ⚙️ Configuration
- 🔐 Security
- 🧩 Integration
- 📊 Data/Analytics
- 🔄 Process/Workflow
- ✅ Requirements/Checklist

### Status Indicators
- ✅ Complete
- 🚧 In Progress
- 🔜 Planned
- ❌ Deprecated
- ⚠️ Warning/Important

## Review Process

1. **Self-Review**: Check for formatting, spelling, and clarity
2. **Peer Review**: Have at least one team member review the document
3. **Technical Review**: For technical specifications, ensure technical accuracy
4. **Final Review**: Update based on feedback and finalize

## Best Practices

1. **Be Concise**: Keep documentation clear and to the point
2. **Use Examples**: Include examples to illustrate concepts
3. **Keep Updated**: Update documentation when features change
4. **Cross-Reference**: Link to related documents
5. **Use Visuals**: Include diagrams, charts, or screenshots when helpful
6. **Consider Audience**: Write for the intended audience (developers, stakeholders, etc.)
7. **Avoid Jargon**: Define technical terms or acronyms when first used
8. **Test Links**: Ensure all links work correctly
9. **Version Control**: Document major changes in a changelog section
10. **Accessibility**: Ensure documentation is accessible (alt text for images, etc.)
