# 🚀 Getting Started with Reportly

Welcome to the Reportly development team! This guide will walk you through the process of setting up the Reportly project on your local machine and getting started with development.

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Node.js** (v20.x or later)
- **npm** (v10.x or later)
- **Git** (v2.x or later)
- **MongoDB** (local instance or connection to MongoDB Atlas)
- **Supabase** account (for authentication and storage)

## 🔄 Clone the Repository

1. Open your terminal and navigate to the directory where you want to clone the project
2. Clone the repository:

```bash
git clone https://github.com/your-organization/reportly.git
cd reportly
```

## ⚙️ Environment Setup

1. Create a `.env.local` file in the root directory of the project:

```bash
cp .env.example .env.local
```

2. Open the `.env.local` file and update the following variables:

```
# MongoDB Connection
MONGODB_URI=mongodb+srv://your-connection-string

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenAI Configuration (if using AI features)
OPENAI_API_KEY=your-openai-api-key

# Application Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 📦 Install Dependencies

Install the project dependencies:

```bash
npm install
```

## 🗄️ Database Setup

### Option 1: Local MongoDB

1. Make sure MongoDB is running on your local machine
2. Update the `MONGODB_URI` in your `.env.local` file to point to your local MongoDB instance:

```
MONGODB_URI=mongodb://localhost:27017/reportly
```

### Option 2: MongoDB Atlas

1. Create a cluster in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with read/write permissions
3. Get your connection string and update the `MONGODB_URI` in your `.env.local` file

## 🔐 Supabase Setup

1. Create a new project in [Supabase](https://supabase.com/)
2. Go to Project Settings > API to get your project URL and API keys
3. Update the Supabase variables in your `.env.local` file
4. Enable Email Auth in Authentication > Providers
5. Set up storage buckets for file uploads:
   - Go to Storage > Buckets
   - Create a new bucket called `reports`
   - Set the bucket privacy to `Private`

## 🏃‍♂️ Run the Development Server

Start the development server:

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## 🧪 Run Tests

### Unit Tests

```bash
npm run test
```

### Integration Tests

```bash
npm run test:integration
```

### End-to-End Tests

```bash
npm run test:e2e
```

## 🛠️ Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run Jest tests
- `npm run test:watch` - Run Jest in watch mode
- `npm run test:e2e` - Run end-to-end tests with Cypress

## 📁 Project Structure

```
reportly/
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages and layouts
│   │   ├── actions/     # Server actions for data mutations
│   │   ├── api/         # API routes
│   │   └── components/  # Page-specific components
│   ├── components/      # Shared React components
│   ├── contexts/        # React context providers
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and services
│   │   ├── ai/          # AI integration utilities
│   │   ├── auth/        # Authentication utilities
│   │   ├── db/          # Database utilities
│   │   └── utils/       # General utilities
│   ├── models/          # Mongoose data models
│   └── types/           # TypeScript type definitions
├── docs/                # Project documentation
├── tests/               # Test files
│   ├── unit/            # Unit tests
│   ├── integration/     # Integration tests
│   └── e2e/             # End-to-end tests
└── scripts/             # Utility scripts
```

## 🔄 Development Workflow

1. **Pull the latest changes** from the main branch:

```bash
git pull origin main
```

2. **Create a new branch** for your feature or bug fix:

```bash
git checkout -b feature/your-feature-name
```

3. **Make your changes** and commit them with a descriptive message:

```bash
git add .
git commit -m "Add feature: your feature description"
```

4. **Run tests** to ensure your changes don't break existing functionality:

```bash
npm run test
```

5. **Push your branch** to the remote repository:

```bash
git push origin feature/your-feature-name
```

6. **Create a pull request** from your branch to the main branch

## 🐛 Troubleshooting

### MongoDB Connection Issues

- Ensure MongoDB is running on your machine
- Check that your connection string is correct
- Verify network access if using MongoDB Atlas

### Supabase Authentication Issues

- Ensure your Supabase URL and keys are correct
- Check that Email Auth is enabled in your Supabase project
- Verify CORS settings in Supabase if experiencing authentication issues

### Next.js Build Errors

- Clear the `.next` directory: `rm -rf .next`
- Reinstall dependencies: `npm ci`
- Check for TypeScript errors: `npm run lint`

## 📚 Additional Resources

- [Project Documentation](./README.md)
- [Technical Architecture](./project/architecture.md)
- [API Documentation](./specifications/api/api-reference.md)
- [Contributing Guide](./CONTRIBUTING.md)

## 🆘 Getting Help

If you encounter any issues or have questions, please:

1. Check the existing documentation
2. Look for similar issues in the project issue tracker
3. Ask in the team communication channel
4. Reach out to the project maintainers

Welcome to the team, and happy coding! 🎉
