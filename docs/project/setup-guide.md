# 📘 Reportly Setup Guide

This visual guide will help you understand the Reportly architecture and setup process.

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Browser                           │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App                             │
│                                                                 │
│  ┌─────────────────┐    ┌─────────────────┐    ┌──────────────┐ │
│  │                 │    │                 │    │              │ │
│  │  React UI       │◄──►│  Server Actions │◄──►│  API Routes  │ │
│  │  Components     │    │                 │    │              │ │
│  └─────────────────┘    └─────────────────┘    └──────────────┘ │
│                                │                      │         │
└────────────────────────────────┼──────────────────────┼─────────┘
                                 │                      │
                                 ▼                      ▼
┌─────────────────────────┐    ┌─────────────────────────────────┐
│                         │    │                                 │
│    MongoDB Database     │◄──►│    Supabase                     │
│    (Reports, Comments)  │    │    (Auth, Storage, User Data)   │
│                         │    │                                 │
└─────────────────────────┘    └─────────────────────────────────┘
           │                                    │
           │                                    │
           ▼                                    ▼
┌─────────────────────────┐    ┌─────────────────────────────────┐
│                         │    │                                 │
│    OpenAI API           │    │    Other External Services      │
│    (AI Suggestions)     │    │    (Analytics, etc.)            │
│                         │    │                                 │
└─────────────────────────┘    └─────────────────────────────────┘
```

## 🔄 Setup Process Flow

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│             │     │             │     │             │     │             │
│  Clone Repo │────►│  Configure  │────►│  Install    │────►│  Start Dev  │
│             │     │  .env       │     │  Dependencies│     │  Server     │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │             │
                    │  Setup      │
                    │  External   │
                    │  Services   │
                    └─────────────┘
                           │
                           ├────────────────┬─────────────────┐
                           ▼                ▼                 ▼
                    ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
                    │             │  │             │  │             │
                    │  MongoDB    │  │  Supabase   │  │  OpenAI     │
                    │  Setup      │  │  Setup      │  │  API Key    │
                    └─────────────┘  └─────────────┘  └─────────────┘
```

## 🗄️ MongoDB Setup

### Option 1: Local MongoDB

1. Install MongoDB Community Edition:
   - **macOS**: `brew install mongodb-community`
   - **Windows**: Download installer from MongoDB website
   - **Linux**: Follow distribution-specific instructions

2. Start MongoDB service:
   - **macOS**: `brew services start mongodb-community`
   - **Windows**: MongoDB runs as a service
   - **Linux**: `sudo systemctl start mongod`

3. Configure connection string in `.env.local`:
   ```
   MONGODB_URI=mongodb://localhost:27017/reportly
   ```

### Option 2: MongoDB Atlas

1. Create MongoDB Atlas account at [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier available)
3. Set up database access user
4. Configure network access (IP whitelist)
5. Get connection string and add to `.env.local`:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/reportly
   ```

## 🔐 Supabase Setup

1. Create Supabase account at [https://supabase.com/](https://supabase.com/)
2. Create a new project
3. Configure authentication:
   - Enable Email auth provider
   - Set up password policies
   - Configure redirect URLs

4. Create storage buckets:
   ```
   reports - for report attachments
   avatars - for user profile images
   ```

5. Get API keys from Project Settings > API and add to `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```

## 🧠 OpenAI Setup (Optional)

1. Create OpenAI account at [https://platform.openai.com/](https://platform.openai.com/)
2. Generate API key from API Keys section
3. Add to `.env.local`:
   ```
   OPENAI_API_KEY=your-openai-api-key
   ```

## 📱 Application Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │             │  │             │  │             │             │
│  │  Auth Pages │  │  Dashboard  │  │  Settings   │             │
│  │             │  │             │  │             │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                                                         │   │
│  │                                                         │   │
│  │                                                         │   │
│  │                 Report Editor                           │   │
│  │                                                         │   │
│  │                                                         │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌─────────────────────────┐  ┌─────────────────────────────┐  │
│  │                         │  │                             │  │
│  │  Comment System         │  │  Notification Center        │  │
│  │                         │  │                             │  │
│  └─────────────────────────┘  └─────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 🔄 Data Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│              │     │              │     │              │     │              │
│  User Action │────►│  React UI    │────►│  Server      │────►│  Database    │
│              │     │  Component   │     │  Action      │     │  Operation   │
└──────────────┘     └──────────────┘     └──────────────┘     └──────────────┘
       ▲                                         │                    │
       │                                         │                    │
       │                                         ▼                    │
       │                                  ┌──────────────┐            │
       │                                  │              │            │
       │                                  │  Validation  │            │
       │                                  │              │            │
       │                                  └──────────────┘            │
       │                                         │                    │
       │                                         ▼                    │
┌──────────────┐                          ┌──────────────┐            │
│              │                          │              │            │
│  UI Update   │◄─────────────────────────│  Response    │◄───────────┘
│              │                          │              │
└──────────────┘                          └──────────────┘
```

## 🛠️ Development Tools

- **VS Code**: Recommended IDE with extensions:
  - ESLint
  - Prettier
  - MongoDB for VS Code
  - Thunder Client (API testing)

- **MongoDB Compass**: GUI for MongoDB database management

- **Supabase CLI**: For local development with Supabase

## 🧪 Testing Environment

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Testing Framework                          │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │             │    │             │    │             │         │
│  │  Jest       │    │  React      │    │  Cypress    │         │
│  │  (Unit)     │    │  Testing    │    │  (E2E)      │         │
│  │             │    │  Library    │    │             │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│                      Test Databases                             │
│                                                                 │
│  ┌─────────────────────────┐    ┌─────────────────────────┐    │
│  │                         │    │                         │    │
│  │  MongoDB Memory Server  │    │  Supabase Local Dev     │    │
│  │  (Unit/Integration)     │    │  (E2E)                  │    │
│  │                         │    │                         │    │
│  └─────────────────────────┘    └─────────────────────────┘    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 📚 Additional Resources

- [Full Getting Started Guide](../getting-started.md)
- [Quick Start Guide](../quick-start.md)
- [Project Architecture](./architecture.md)
- [Technology Stack](./stack.md)
- [Contributing Guide](../CONTRIBUTING.md)
