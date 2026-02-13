# AI Tasks Generator – Mini Planning Tool

A production-ready web application that generates structured project specifications using AI. Built for a backend engineering role evaluation.

## 🎯 Overview

This tool helps users create detailed project specifications by:
- Collecting project goals, target users, and constraints
- Generating structured user stories and tasks using OpenAI
- Organizing tasks by category (Frontend, Backend, Database, etc.)
- Identifying potential risks
- Allowing task editing and reordering
- Exporting specifications as Markdown

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Fastify** - Fast and low overhead web framework
- **TypeScript** - Type-safe development
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **OpenAI API** - LLM for structured generation

### Frontend
- **Next.js 15** (App Router) - React framework
- **TailwindCSS** - Utility-first CSS
- **TypeScript** - Type-safe development

### Deployment
- **Docker** - Containerization
- **docker-compose** - Multi-container orchestration

## 📁 Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   ├── services/        # Business logic (DB, LLM, Export)
│   │   ├── plugins/         # Fastify plugins
│   │   ├── utils/           # Utilities
│   │   ├── types/           # TypeScript types
│   │   ├── app.ts           # Fastify app setup
│   │   └── server.ts        # Server entry point
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # Next.js pages (App Router)
│   │   ├── components/      # React components
│   │   └── lib/             # API client
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key

### Using Docker (Recommended)

1. **Clone and navigate to the project**
   ```bash
   cd "d:\Mini Planning Tool"
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=sk-your-actual-key-here
   ```

3. **Start all services**
   ```bash
   docker-compose up --build
   ```

4. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Status Page: http://localhost:3000/status

### Local Development

#### Backend

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your DATABASE_URL and OPENAI_API_KEY
   ```

4. **Generate Prisma client and push schema**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

#### Frontend

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Features Implemented

### ✅ Core Functionality
- [x] Home page with specification creation form
- [x] Required fields validation (Goal, Target Users, Template Type)
- [x] LLM-powered spec generation using OpenAI
- [x] Structured JSON validation with Zod
- [x] Database persistence with Prisma
- [x] Last 5 specifications list on home page
- [x] Spec detail page with full information
- [x] Task editing (title and description)
- [x] Task reordering (up/down buttons)
- [x] Tasks grouped by category
- [x] Markdown export (copy and download)
- [x] System status page with health checks
- [x] Error handling and validation
- [x] Docker deployment ready

### 🔧 Technical Features
- [x] Strict TypeScript (no `any` types)
- [x] Proper folder structure and separation of concerns
- [x] Environment variable validation
- [x] Graceful error handling
- [x] Database cascade delete
- [x] CORS configuration
- [x] Health check endpoints
- [x] Multi-stage Docker builds

## 🚫 Not Implemented

- Drag-and-drop task reordering (using simple up/down buttons instead)
- User authentication
- Multiple users/projects
- Task deletion
- Spec editing after creation
- Real-time collaboration
- Unit/integration tests

## 🏗️ Architecture

### Database Schema

**Spec** - Main specification
- id, goal, users, constraints, templateType, createdAt

**UserStory** - Feature breakdown
- id, specId, title, description, position

**Task** - Individual work items
- id, storyId, title, description, groupName, position

**Risk** - Identified risks
- id, specId, description

All relations include cascade delete for data integrity.

### API Endpoints

- `POST /api/specs` - Create new specification
- `GET /api/specs` - List last 5 specifications
- `GET /api/specs/:id` - Get specification details
- `PUT /api/specs/:id/tasks/:taskId` - Update task
- `POST /api/specs/:id/tasks/:taskId/move` - Move task up/down
- `GET /api/specs/:id/export` - Export as Markdown
- `GET /api/status` - System health check

### LLM Integration

Uses OpenAI's `gpt-4o-mini` model with:
- Structured JSON output format
- Zod schema validation
- Error handling for invalid responses
- Retry logic for API failures

## 🔒 Security

- No API keys in code
- Environment variable validation
- Input validation on all endpoints
- Proper error messages (no sensitive data leaks)
- CORS configuration

## 📝 Environment Variables

See `.env.example` for all required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `OPENAI_API_KEY` - OpenAI API key
- `PORT` - Backend port (default: 3001)
- `NEXT_PUBLIC_API_URL` - Backend URL for frontend

## 🧪 Testing

### Manual Testing

1. **Create a specification**
   - Fill out the form on home page
   - Submit and verify LLM generates structured output

2. **View specification**
   - Click on a spec from the recent list
   - Verify all user stories, tasks, and risks are displayed

3. **Edit tasks**
   - Click edit button on a task
   - Modify title/description and save

4. **Reorder tasks**
   - Use up/down buttons to change task order
   - Verify position updates correctly

5. **Export**
   - Test "Copy as Markdown" button
   - Test "Download .md" button

6. **Status page**
   - Visit `/status`
   - Verify all services show healthy

### API Testing

```bash
# Health check
curl http://localhost:3001/api/status

# Create spec
curl -X POST http://localhost:3001/api/specs \
  -H "Content-Type: application/json" \
  -d '{
    "goal": "Build a task management app",
    "users": "Project managers and team leads",
    "templateType": "Web App"
  }'

# List specs
curl http://localhost:3001/api/specs
```

## 🚢 Deployment

The application is deployment-ready with Docker:

```bash
docker-compose up --build
```

This will:
1. Start PostgreSQL database
2. Build and start backend (with Prisma migrations)
3. Build and start frontend
4. Set up networking between services

## 📚 Additional Documentation

- [AI_NOTES.md](./AI_NOTES.md) - AI tools used and development notes
- [PROMPTS_USED.md](./PROMPTS_USED.md) - Prompts used during development
- [ABOUTME.md](./ABOUTME.md) - Developer information

## 🤝 Contributing

This is an evaluation project. Not accepting contributions.

## 📄 License

ISC
