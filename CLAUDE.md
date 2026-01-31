# EduNexus MVP

EdTech platform for Nepal with classroom management (attendance, grades, assignments) for Students, Teachers, and Admins.

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind, shadcn/ui, Zustand, axios
- **Backend:** Express, TypeScript, Prisma, PostgreSQL
- **Auth:** Custom JWT (access + refresh tokens)
- **Database:** PostgreSQL (local via Docker, production on Supabase)

## Project Structure

```
ed_tech_mvp/
├── packages/
│   ├── frontend/           # Next.js 14 App Router
│   │   └── src/
│   │       ├── app/        # Pages (auth, admin, teacher, student)
│   │       ├── components/ # UI components
│   │       ├── lib/        # API client, utilities
│   │       ├── hooks/      # Custom React hooks
│   │       ├── store/      # Zustand stores
│   │       └── types/      # TypeScript types
│   │
│   └── backend/            # Express + TypeScript
│       ├── src/
│       │   ├── routes/     # API routes
│       │   ├── controllers/# Request handlers
│       │   ├── middleware/ # Auth, validation, RBAC
│       │   ├── services/   # Business logic
│       │   └── utils/      # Helpers
│       └── prisma/
│           └── schema.prisma
│
├── docker-compose.yml      # Local PostgreSQL
├── PLAN.md                 # Full implementation plan
└── package.json            # Workspace root
```

## Commands

```bash
# Start local PostgreSQL
docker compose up -d

# Backend dev server (port 3001)
pnpm dev:backend

# Frontend dev server (port 3000)
pnpm dev:frontend

# Run Prisma migrations
cd packages/backend && npx prisma migrate dev

# Seed database
cd packages/backend && npx prisma db seed
```

## Environment Variables

### Backend (`packages/backend/.env`)
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/edunexus?schema=public"
JWT_SECRET="your-secret-key-at-least-32-characters-long"
JWT_REFRESH_SECRET="your-refresh-secret-at-least-32-characters"
CORS_ORIGIN="http://localhost:3000"
PORT=3001
```

### Frontend (`packages/frontend/.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

## User Roles

- **ADMIN:** Manage users, classes, subjects, academic years, grading scales
- **TEACHER:** Mark attendance, enter grades, create/grade assignments
- **STUDENT:** View attendance/grades, submit assignments

## API Structure

- `POST /api/auth/login` - Login, returns access + refresh tokens
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Revoke refresh token
- `GET /api/auth/me` - Current user profile
- `/api/admin/*` - Admin CRUD endpoints
- `/api/teacher/*` - Teacher endpoints
- `/api/student/*` - Student endpoints

## Conventions

- Use TypeScript strict mode
- Use Zod for validation
- API responses: `{ data: ... }` or `{ error: "message" }`
- Commit messages: conventional commits (feat:, fix:, chore:)
- Keep components small and focused
