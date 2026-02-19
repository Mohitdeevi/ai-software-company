# PromptCorp OS

**One Prompt. Production App.**

A multi-agent AI orchestration platform that transforms a single plain-English prompt into a fully deployed, production-ready full-stack application — complete with code, tests, CI/CD, Docker, and Kubernetes.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                      Frontend (Next.js 14)              │
│              Dark UI · TailwindCSS · SWR · SSE          │
└──────────────────────┬──────────────────────────────────┘
                       │ REST API + SSE
┌──────────────────────▼──────────────────────────────────┐
│                    Backend (Express.js)                  │
│         JWT Auth · Zod Validation · Rate Limiting       │
├─────────────┬───────────────┬───────────────────────────┤
│  MongoDB    │    Redis      │   BullMQ Job Queue        │
│  (Mongoose) │   (ioredis)   │   (Orchestration Worker)  │
└─────────────┴───────┬───────┴───────────────────────────┘
                      │
        ┌─────────────▼─────────────┐
        │   11 AI Agent Orchestra   │
        │                           │
        │  Manager · Sales · PM     │
        │  Scrum · Architect        │
        │  Backend · Frontend       │
        │  Tester · DevOps          │
        │  Security · Observability │
        └───────────────────────────┘
```

## Tech Stack

| Layer          | Technology                                              |
| -------------- | ------------------------------------------------------- |
| Frontend       | Next.js 14 (App Router), React 18, TypeScript           |
| Styling        | TailwindCSS, Glassmorphism, Custom Animations           |
| State          | SWR (server state), React hooks (local state)           |
| Backend        | Node.js, Express 4, ES Modules                         |
| Database       | MongoDB with Mongoose ODM                               |
| Cache/Queue    | Redis (ioredis), BullMQ                                 |
| Auth           | JWT (access + refresh tokens), bcrypt, httpOnly cookies |
| Validation     | Zod schemas on all endpoints                            |
| LLM            | Claude API (Anthropic)                                  |
| Infrastructure | Docker, Kubernetes, GitHub Actions CI/CD                |
| Monitoring     | Prometheus metrics (prom-client), Pino logger           |

## Project Structure

```
AI-software-company/
├── backend/
│   ├── src/
│   │   ├── config/          # env, db, redis configuration
│   │   ├── controllers/     # auth, project, agent controllers
│   │   ├── middleware/       # authenticate, authorize, validate, rateLimiter, errorHandler
│   │   ├── models/          # User, Project, AgentExecution (Mongoose)
│   │   ├── queues/          # BullMQ queue + orchestration worker
│   │   ├── routes/          # auth, projects, agents, health, metrics
│   │   ├── services/        # LLM client, orchestrator, code generator, 11 agents
│   │   ├── utils/           # logger, errors, tokenCounter
│   │   ├── validators/      # Zod schemas (auth, project)
│   │   ├── app.js           # Express app setup
│   │   └── server.js        # Entry point + graceful shutdown
│   ├── tests/               # Jest unit + integration tests
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── (auth)/      # Login + Register pages
│   │   │   ├── (dashboard)/ # Projects, Settings, Project Detail
│   │   │   ├── layout.tsx   # Root layout (dark theme)
│   │   │   ├── page.tsx     # Landing page
│   │   │   └── globals.css  # Animations, glass effects, utilities
│   │   ├── components/
│   │   │   ├── ui/          # Button, Input, Card, Badge
│   │   │   └── projects/    # ProjectCard, AgentProgress, FileBrowser, BuildLog
│   │   ├── hooks/           # useAuth, useProject, useSSE
│   │   ├── lib/             # API client, auth tokens, utils
│   │   └── types/           # TypeScript interfaces
│   ├── tailwind.config.ts
│   └── package.json
├── infrastructure/
│   ├── docker/              # Multi-stage Dockerfiles
│   └── k8s/                 # Kubernetes manifests (14 files)
├── .github/workflows/       # CI + CD pipelines
├── docker-compose.yml       # Local dev (backend, frontend, mongo, redis)
├── scripts/                 # setup.sh, deploy.sh
└── docs/                    # Orchestrator output JSON
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **MongoDB** (local or Atlas)
- **Redis** (local or Docker)

### 1. Clone and install

```bash
git clone <your-repo-url>
cd AI-software-company

# Backend
cd backend
cp .env.example .env    # Edit .env with your config
npm install

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

Edit `backend/.env`:

```env
MONGODB_URI=mongodb://localhost:27017/promptcorp
REDIS_URL=redis://localhost:6380        # Match your Redis port
JWT_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-refresh-secret
LLM_API_KEY=your-anthropic-api-key      # Required for AI agents
CORS_ORIGIN=http://localhost:3000
```

### 3. Start development servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev          # Starts on http://localhost:4000

# Terminal 2 — Frontend
cd frontend
npm run dev          # Starts on http://localhost:3000
```

### 4. Using Docker Compose (alternative)

```bash
docker-compose up -d
```

This starts all four services: backend (4000), frontend (3000), MongoDB (27017), and Redis (6379).

## API Endpoints

### Auth (`/api/v1/auth`)

| Method | Endpoint    | Description              | Auth |
| ------ | ----------- | ------------------------ | ---- |
| POST   | `/register` | Create account           | No   |
| POST   | `/login`    | Login + receive tokens   | No   |
| POST   | `/refresh`  | Refresh access token     | No   |
| POST   | `/logout`   | Invalidate session       | Yes  |
| GET    | `/me`       | Get current user profile | Yes  |

### Projects (`/api/v1/projects`)

| Method | Endpoint        | Description                  | Auth |
| ------ | --------------- | ---------------------------- | ---- |
| GET    | `/`             | List user's projects         | Yes  |
| POST   | `/`             | Create project (starts AI)   | Yes  |
| GET    | `/:id`          | Get project details          | Yes  |
| DELETE | `/:id`          | Delete project               | Yes  |
| GET    | `/:id/files`    | List generated files         | Yes  |
| GET    | `/:id/download` | Download project as ZIP      | Yes  |
| POST   | `/:id/retry`    | Retry failed generation      | Yes  |
| GET    | `/:id/stream`   | SSE real-time progress       | Yes  |

### Health

| Method | Endpoint  | Description                      |
| ------ | --------- | -------------------------------- |
| GET    | `/health` | Liveness check                   |
| GET    | `/ready`  | Readiness (MongoDB + Redis)      |

## The 11 AI Agents

| #  | Agent              | Role                                          |
| -- | ------------------ | --------------------------------------------- |
| 1  | Manager            | Orchestrates the entire pipeline              |
| 2  | Sales              | Validates idea viability and market fit        |
| 3  | Product Manager    | Writes PRD with features, user stories         |
| 4  | Scrum Master       | Creates sprint plan and task breakdown         |
| 5  | Architect          | Designs system architecture and schemas        |
| 6  | Backend Developer  | Generates APIs, models, business logic         |
| 7  | Frontend Developer | Builds UI components and pages                 |
| 8  | Tester             | Writes unit + integration tests                |
| 9  | DevOps Engineer    | Creates Docker, CI/CD, K8s configs             |
| 10 | Security           | Implements auth, RBAC, vulnerability checks    |
| 11 | Observability      | Adds metrics, logging, health checks           |

## 9 Execution Phases

```
Phase 1: Strategic Definition    → Manager + Sales assess feasibility
Phase 2: Product Definition      → PM writes PRD, Scrum creates sprints
Phase 3: Architecture Design     → Architect designs full system
Phase 4: Backend Development     → Backend dev generates server code
Phase 5: Frontend Development    → Frontend dev generates UI
Phase 6: Testing                 → Tester writes comprehensive tests
Phase 7: DevOps & Infrastructure → DevOps creates Docker + K8s + CI/CD
Phase 8: Security Hardening      → Security agent audits and hardens
Phase 9: Observability           → Monitoring, logging, alerting setup
```

## Frontend Features

- Dark glassmorphism UI with floating ambient orbs
- Split-screen auth (login + register) with password strength indicator
- Real-time agent progress timeline via SSE
- Integrated file browser with syntax highlighting
- Live build log viewer with auto-scroll
- Responsive design (mobile + desktop)

## Testing

```bash
# Backend tests
cd backend
npm test                    # Run all tests
npm run test:coverage       # With coverage report (80% threshold)
```

## Deployment

### Kubernetes

```bash
# Apply all manifests
kubectl apply -f infrastructure/k8s/

# Or use the deploy script
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Docker

```bash
# Build images
docker build -f infrastructure/docker/Dockerfile.backend -t promptcorp-backend ./backend
docker build -f infrastructure/docker/Dockerfile.frontend -t promptcorp-frontend ./frontend
```

## Environment Variables

| Variable               | Default                          | Description                |
| ---------------------- | -------------------------------- | -------------------------- |
| `NODE_ENV`             | `development`                    | Environment mode           |
| `PORT`                 | `4000`                           | Backend server port        |
| `MONGODB_URI`          | `mongodb://localhost:27017/...`  | MongoDB connection string  |
| `REDIS_URL`            | `redis://localhost:6379`         | Redis connection URL       |
| `JWT_SECRET`           | —                                | Access token signing key   |
| `JWT_REFRESH_SECRET`   | —                                | Refresh token signing key  |
| `JWT_EXPIRY`           | `15m`                            | Access token TTL           |
| `JWT_REFRESH_EXPIRY`   | `7d`                             | Refresh token TTL          |
| `LLM_API_KEY`          | —                                | Anthropic API key          |
| `LLM_MODEL`            | `claude-sonnet-4-6`              | Claude model to use        |
| `CORS_ORIGIN`          | `http://localhost:3000`          | Allowed CORS origin        |

## License

MIT

---

Built with AI agents.
