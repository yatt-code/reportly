# 📝 Reportly

Reportly is a full-stack SaaS application for creating, managing, and collaborating on reports with AI-powered assistance.

## ✨ Features

- **Rich Text Editor** with Markdown support, image uploads, and code blocks
- **AI-Powered Assistance** for content generation and improvement
- **Threaded Comments** for collaborative feedback
- **@Mentions** to notify team members
- **Gamification** with XP, levels, and achievements
- **Multi-tenant Architecture** with Organizations and Workspaces
- **Role-based Access Control** for secure content management
- **Real-time Notifications** for user interactions

## 🚀 Getting Started

### Prerequisites

- Node.js v20.x+
- npm v10.x+
- MongoDB (local or Atlas)
- Supabase account

### Quick Start

```bash
# Clone the repository
git clone https://github.com/your-organization/reportly.git
cd reportly

# Install dependencies
npm install

# Copy example environment file
cp .env.example .env.local

# Configure your environment variables
# Edit .env.local with your MongoDB, Supabase, and other credentials

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

For detailed setup instructions, see the [Getting Started Guide](docs/getting-started.md).

## 📚 Documentation

Comprehensive documentation is available in the [docs](./docs) directory:

- [Quick Start Guide](docs/quick-start.md)
- [Getting Started Guide](docs/getting-started.md)
- [Setup Guide with Diagrams](docs/project/setup-guide.md)
- [Project Overview](docs/project/overview.md)
- [Technical Architecture](docs/project/architecture.md)
- [Technology Stack](docs/project/stack.md)
- [AI Collaboration](docs/project/ai-collaboration.md)
- [Contributing Guide](docs/CONTRIBUTING.md)

## 🧪 Testing

```bash
# Run all tests
npm run test

# Run specific test suites
npm run test:unit
npm run test:integration
npm run test:e2e
```

## 🔧️ Built With

- [Next.js](https://nextjs.org/) - React framework
- [MongoDB](https://www.mongodb.com/) - Database
- [Supabase](https://supabase.com/) - Authentication and storage
- [TipTap](https://tiptap.dev/) - Rich text editor
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [OpenAI](https://openai.com/) - AI integration

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- All the open-source projects that made this possible
- The development team for their hard work and dedication
- Our early users for their valuable feedback
