# 📘 Technical Architecture: Reportly

## System Architecture

Reportly follows a modern full-stack architecture with a clear separation of concerns:

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  Client Layer   │────▶│  Server Layer   │────▶│  Database Layer │
│  (Next.js)      │     │  (Node.js)      │     │  (MongoDB)      │
│                 │◀────│                 │◀────│                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│                 │     │                 │     │                 │
│  UI Components  │     │  Server Actions │     │  Data Models    │
│  (React)        │     │  (Next.js API)  │     │  (Mongoose)     │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Client Layer

The client layer is built with Next.js 15 and React 19, utilizing the App Router architecture for efficient page rendering and navigation. Key components include:

- **UI Components**: Reusable React components for consistent user interface
- **Context Providers**: State management for authentication, notifications, and workspaces
- **Client-side Validation**: Form validation and data integrity checks
- **Theme System**: Light and dark mode support with customizable themes

### Server Layer

The server layer is implemented using Next.js Server Actions and API routes, providing a secure and efficient way to handle data operations. Key components include:

- **Server Actions**: Secure CRUD operations for reports, comments, and user data
- **Authentication Middleware**: User authentication and authorization checks
- **AI Integration**: Connection to AI services for content analysis and generation
- **Error Handling**: Comprehensive error handling and logging

### Database Layer

The database layer uses MongoDB for flexible document storage, with Mongoose for schema validation and type safety. Key components include:

- **Data Models**: Mongoose schemas for reports, comments, users, and other entities
- **Indexes**: Optimized indexes for efficient queries
- **Validation**: Schema-level validation for data integrity
- **Relationships**: Document references for related data

### Authentication System

Authentication is handled by Supabase, providing secure user management without the need for custom authentication logic:

- **User Registration**: Secure user registration with email verification
- **Login**: Email/password and social login options
- **Session Management**: Secure session handling and token refresh
- **RBAC**: Role-based access control for different user types

## Data Flow

### Report Creation Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │     │          │
│  Editor  │────▶│  Client  │────▶│  Server  │────▶│ Database │────▶│    AI    │
│          │     │          │     │  Action  │     │          │     │          │
└──────────┘     └──────────┘     └──────────┘     └──────────┘     └──────────┘
                                        │                                 │
                                        ▼                                 ▼
                                  ┌──────────┐                     ┌──────────┐
                                  │          │                     │          │
                                  │ Response │◀────────────────────│  Summary │
                                  │          │                     │   Tags   │
                                  └──────────┘                     └──────────┘
```

### Comment System Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│          │     │          │     │          │     │          │
│ Comment  │────▶│  Server  │────▶│ Database │────▶│ Mention  │
│   Form   │     │  Action  │     │          │     │ Detection│
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                                  │
                      ▼                                  ▼
                ┌──────────┐                      ┌──────────┐
                │          │                      │          │
                │Achievement│                     │Notification│
                │  Check   │                      │  System  │
                └──────────┘                      └──────────┘
```

## Multi-tenant Architecture

```
┌─────────────────────────────────────────┐
│              Organization               │
└─────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌─────────────┐┌─────────────┐┌─────────────┐
│  Workspace  ││  Workspace  ││  Workspace  │
└─────────────┘└─────────────┘└─────────────┘
        │           │           │
    ┌───┴───┐   ┌───┴───┐   ┌───┴───┐
    ▼       ▼   ▼       ▼   ▼       ▼
┌─────┐ ┌─────┐┌─────┐ ┌─────┐┌─────┐ ┌─────┐
│Report│ │Users││Report│ │Users││Report│ │Users│
└─────┘ └─────┘└─────┘ └─────┘└─────┘ └─────┘
```

The multi-tenant architecture provides:
- Clear separation between organizations
- Workspace-level data isolation
- Efficient access control
- Scalable user management

## Technology Stack

### Frontend
- **Framework**: Next.js 15 with React 19
- **UI Components**: Custom components with Tailwind CSS
- **State Management**: React Context API
- **Editor**: TipTap with extensions
- **Forms**: React Hook Form with Zod validation

### Backend
- **Runtime**: Node.js
- **API**: Next.js Server Actions and API Routes
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Logging**: Custom logging utility

### Database
- **Primary Database**: MongoDB
- **ODM**: Mongoose
- **Auth Database**: Supabase PostgreSQL

### AI Integration
- **LLM**: OpenAI GPT-4
- **Vector Database**: Pinecone (for report clustering)
- **Text Analysis**: Custom NLP utilities

### DevOps
- **Version Control**: Git
- **CI/CD**: GitHub Actions
- **Deployment**: Vercel
- **Monitoring**: Vercel Analytics

## Security Considerations

- **Authentication**: JWT-based authentication with Supabase
- **Authorization**: Role-based access control
- **Data Validation**: Server-side validation with Zod
- **Input Sanitization**: XSS protection
- **API Security**: Rate limiting and CSRF protection
- **Database Security**: Proper indexing and access controls
