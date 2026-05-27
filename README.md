# AI TaskFlow

A fullstack AI-powered task management application built with React, Node.js, PostgreSQL, and Groq AI. Users can manage tasks with smart AI categorization, productivity suggestions, and intelligent analysis.

🔗 **Live Demo:** [ai-task-flow-five.vercel.app](https://ai-task-flow-five.vercel.app)

---

## Features

- **JWT Authentication** — Secure register and login with bcrypt password hashing
- **Full Task CRUD** — Create, read, update, and delete tasks
- **AI Auto-categorization** — Every new task is automatically tagged (work, personal, urgent, health) and prioritized (high, medium, low) by AI
- **AI Task Suggestions** — Get smart task recommendations based on your current workload
- **AI Productivity Tips** — Get a focused tip for any individual task
- **AI Analysis** — Analyze all open tasks and get told exactly what to focus on first
- **Protected Routes** — Dashboard is only accessible to authenticated users

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon), Prisma ORM |
| Authentication | JWT, bcryptjs |
| AI | Groq API (Llama 3.3 70B) |
| Deployment | Vercel (frontend), Render (backend) |

---

## System Architecture

```
React (Vercel)
     ↓  HTTP + JWT
Node.js / Express (Render)
     ↓               ↓
PostgreSQL         Groq AI API
(Neon)             (Llama 3.3)
```

---

## Project Structure

```
ai-taskflow/
├── backend/
│   ├── lib/
│   │   └── prisma.js          # Prisma singleton client
│   ├── middleware/
│   │   └── auth.js            # JWT auth middleware
│   ├── prisma/
│   │   └── schema.prisma      # Database schema
│   ├── routes/
│   │   ├── auth.js            # Register + Login
│   │   ├── tasks.js           # CRUD operations
│   │   └── ai.js              # AI endpoints
│   ├── prisma.config.ts       # Prisma 7 config
│   └── server.js              # Express entry point
└── frontend/
    └── src/
        ├── context/
        │   └── AuthContext.jsx # Global auth state
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   └── Dashboard.jsx
        ├── services/
        │   └── api.js          # All API calls
        └── App.jsx             # Routes + PrivateRoute
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login, returns JWT |

### Tasks (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks | Get all user tasks |
| POST | /api/tasks | Create a task |
| PATCH | /api/tasks/:id | Update a task |
| DELETE | /api/tasks/:id | Delete a task |

### AI (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/categorize | Auto-tag and prioritize |
| POST | /api/ai/suggest | Suggest new tasks |
| POST | /api/ai/tip | Get tip for a task |
| POST | /api/ai/analyze | Analyze all tasks |

---

## Database Schema

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   (bcrypt hashed)
  tasks     Task[]
  createdAt DateTime @default(now())
}

model Task {
  id        String   @id @default(uuid())
  text      String
  tag       String   @default("personal")
  priority  String   @default("medium")
  done      Boolean  @default(false)
  aiNote    String   @default("")
  userId    String   (foreign key)
  createdAt DateTime @default(now())
}
```

---

## Running Locally

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon free tier works)
- Groq API key (free at console.groq.com)

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npx prisma generate
npx prisma db push
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
# Create .env file
echo "VITE_API_URL=http://localhost:5000/api" > .env
npm run dev
```

### Environment Variables

**backend/.env**
```
DATABASE_URL=your_neon_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_key
PORT=5000
```

**frontend/.env**
```
VITE_API_URL=http://localhost:5000/api
```

---

## Key Learning Concepts

- **REST API design** — Resources + HTTP methods
- **JWT Authentication** — Stateless auth flow
- **Password security** — bcrypt hashing with salt rounds
- **ORM pattern** — Prisma abstracting SQL queries
- **One-to-Many relations** — User owns many Tasks
- **Middleware pattern** — Auth guard on protected routes
- **Interceptor pattern** — Axios auto-attaching JWT
- **Context API** — Global auth state without prop drilling
- **Private Routes** — Protecting frontend pages
- **SPA routing** — Vercel rewrite rules for React Router
- **CORS** — Cross-origin configuration for production
- **AI Integration** — LLM API calls from backend (never frontend)

---

## Why AI calls go through the backend

The AI routes live in the backend, not the frontend. This is intentional:

1. **Security** — API keys are never exposed to the browser
2. **Control** — Rate limiting and logging can be added server-side
3. **Data access** — Backend can combine DB data with AI prompts
4. **Flexibility** — Switch AI providers without touching frontend code

---

## Author

**Avanish Tiwari** — Fullstack Developer
