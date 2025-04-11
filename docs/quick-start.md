# 🚀 Reportly Quick Start Guide

This quick start guide will help you get the Reportly application up and running on your local machine.

## 📋 Prerequisites

- Node.js v20.x+
- npm v10.x+
- MongoDB (local or Atlas)
- Supabase account

## 🔄 Clone & Install

```bash
# Clone the repository
git clone https://github.com/your-organization/reportly.git
cd reportly

# Install dependencies
npm install

# Copy example environment file
cp .env.example .env.local
```

## ⚙️ Configure Environment

Edit `.env.local` and add your configuration:

```
MONGODB_URI=mongodb+srv://your-connection-string
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
OPENAI_API_KEY=your-openai-api-key (optional)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🏃‍♂️ Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

## 🧪 Run Tests

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 📚 Key Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter
npm run test         # Run tests
```

## 📖 Documentation

For more detailed instructions, see the [full Getting Started guide](./getting-started.md).

## 🔄 Development Workflow

1. Pull latest changes: `git pull origin main`
2. Create feature branch: `git checkout -b feature/your-feature`
3. Make changes and commit: `git commit -m "Add feature: description"`
4. Run tests: `npm run test`
5. Push branch: `git push origin feature/your-feature`
6. Create pull request

## 🆘 Need Help?

Check the [Troubleshooting section](./getting-started.md#troubleshooting) in the full guide or reach out to the team.
