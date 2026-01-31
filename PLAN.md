# EduNexus MVP - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a production-ready EdTech MVP for Nepal with classroom management (attendance, grades, assignments) for Students, Teachers, and Admins.

**Architecture:** Monorepo with separate frontend (Next.js 14) and backend (Express + Prisma) packages. Custom JWT authentication. PostgreSQL on Supabase free tier.

**Tech Stack:** Next.js 14, Express, TypeScript, Prisma, Supabase, Tailwind, shadcn/ui, Zustand, next-intl

---

## What We're NOT Building (Cut for MVP)

- No gamification (XP, badges, streaks, leaderboards)
- No parent dashboard
- No pre-school module
- No activity feed/social features
- No offline mode
- No payment integrations

---

## Project Structure (Monorepo)

```
ed_tech_mvp/
├── packages/
│   ├── frontend/           # Next.js 14 App Router
│   │   ├── src/
│   │   │   ├── app/        # Pages (auth, admin, teacher, student)
│   │   │   ├── components/ # UI components
│   │   │   ├── lib/        # API client, utilities
│   │   │   ├── hooks/      # Custom React hooks
│   │   │   ├── store/      # Zustand stores
│   │   │   ├── types/      # TypeScript types
│   │   │   └── locales/    # i18n (en.json, ne.json)
│   │   └── package.json
│   │
│   ├── backend/            # Express + TypeScript
│   │   ├── src/
│   │   │   ├── routes/     # API routes
│   │   │   ├── controllers/ # Request handlers
│   │   │   ├── middleware/  # Auth, validation, RBAC
│   │   │   ├── services/    # Business logic
│   │   │   └── utils/       # Helpers
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   │
│   └── shared/             # Shared types & utilities
│       └── src/types/
│
├── package.json            # Workspace root
└── pnpm-workspace.yaml
```

---

## Database Schema (Key Tables)

| Table | Purpose |
|-------|---------|
| `users` | All users with role (ADMIN/TEACHER/STUDENT) |
| `refresh_tokens` | JWT refresh token storage |
| `academic_years` | School years (e.g., "2081-82") |
| `classes` | Grade + section (e.g., "Grade 5A") |
| `subjects` | Subject catalog (Math, English, etc.) |
| `class_subjects` | Links classes to subjects with assigned teacher |
| `teachers` | Teacher profile (extends users) |
| `students` | Student profile (extends users) |
| `attendance` | Daily attendance records |
| `assignments` | Homework, projects, quizzes |
| `submissions` | Student submissions with grades |
| `grades` | Term-wise grades per subject |
| `grading_scales` | Grading scale definitions (A+, A, B+, etc.) |

---

## Feature Scope by Role

### Admin Features
- Dashboard with school stats
- User management (CRUD teachers, students)
- Academic year setup
- Class management (create, assign class teacher)
- Subject management (create, assign to classes)
- Class-subject-teacher assignments
- Grading scale configuration

### Teacher Features
- Dashboard (today's tasks, pending items)
- Mark attendance (grid view, tap-to-toggle)
- Enter grades (spreadsheet-style)
- Create assignments
- Grade student submissions with feedback

### Student Features
- Dashboard (summary widgets)
- View attendance (calendar view)
- View grades (subject-wise)
- View assignments (list with due dates)
- Submit homework (text or file upload)

---

## API Endpoints

### Auth
```
POST /api/auth/login          # Returns access + refresh tokens
POST /api/auth/logout         # Revokes refresh token
POST /api/auth/refresh        # Get new access token
GET  /api/auth/me             # Current user profile
```

### Admin
```
CRUD /api/admin/users
CRUD /api/admin/academic-years
CRUD /api/admin/classes
CRUD /api/admin/subjects
CRUD /api/admin/class-subjects
CRUD /api/admin/grading-scales
```

### Teacher
```
GET  /api/teacher/dashboard
GET  /api/teacher/classes/:id/attendance
POST /api/teacher/attendance/bulk
GET  /api/teacher/classes/:id/grades
POST /api/teacher/grades/bulk
CRUD /api/teacher/assignments
PUT  /api/teacher/submissions/:id/grade
```

### Student
```
GET  /api/student/dashboard
GET  /api/student/attendance
GET  /api/student/grades
GET  /api/student/assignments
POST /api/student/assignments/:id/submit
```

---

## Implementation Tasks

---

### Task 1: Initialize Monorepo

**Files:**
- Create: `package.json`
- Create: `pnpm-workspace.yaml`
- Create: `.gitignore`

**Step 1: Create root package.json**

```bash
mkdir -p /home/aayushms/work/pet_projects/ed_tech_mvp
cd /home/aayushms/work/pet_projects/ed_tech_mvp
```

```json
{
  "name": "edunexus-mvp",
  "private": true,
  "scripts": {
    "dev:backend": "pnpm --filter backend dev",
    "dev:frontend": "pnpm --filter frontend dev",
    "build": "pnpm -r build",
    "lint": "pnpm -r lint"
  },
  "devDependencies": {
    "typescript": "^5.3.0"
  }
}
```

**Step 2: Create pnpm-workspace.yaml**

```yaml
packages:
  - 'packages/*'
```

**Step 3: Create .gitignore**

```
node_modules
.env
.env.local
dist
.next
*.log
```

**Step 4: Initialize git and commit**

```bash
git init
git add .
git commit -m "chore: initialize monorepo structure"
```

---

### Task 2: Set Up Backend Package

**Files:**
- Create: `packages/backend/package.json`
- Create: `packages/backend/tsconfig.json`
- Create: `packages/backend/src/index.ts`

**Step 1: Create backend package.json**

```json
{
  "name": "backend",
  "version": "1.0.0",
  "main": "dist/index.js",
  "scripts": {
    "dev": "ts-node-dev --respawn src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.1",
    "@prisma/client": "^5.7.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/cors": "^2.8.17",
    "@types/morgan": "^1.9.9",
    "@types/bcryptjs": "^2.4.6",
    "@types/jsonwebtoken": "^9.0.5",
    "@types/node": "^20.10.0",
    "typescript": "^5.3.0",
    "ts-node-dev": "^2.0.0",
    "prisma": "^5.7.0"
  }
}
```

**Step 2: Create backend tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

**Step 3: Create basic Express server**

Create `packages/backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Step 4: Install dependencies and test**

```bash
cd packages/backend
pnpm install
pnpm dev
# Expected: Server running on port 3001
# Test: curl http://localhost:3001/health
```

**Step 5: Commit**

```bash
git add packages/backend
git commit -m "feat: add backend package with Express server"
```

---

### Task 3: Create Prisma Schema

**Files:**
- Create: `packages/backend/prisma/schema.prisma`
- Create: `packages/backend/.env`

**Step 1: Initialize Prisma**

```bash
cd packages/backend
npx prisma init
```

**Step 2: Write complete schema**

Replace `packages/backend/prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  ADMIN
  TEACHER
  STUDENT
}

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  passwordHash  String
  role          UserRole
  firstName     String
  lastName      String
  firstNameNe   String?
  lastNameNe    String?
  phone         String?
  isActive      Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  teacher       Teacher?
  student       Student?
  refreshTokens RefreshToken[]
}

model RefreshToken {
  id        String   @id @default(cuid())
  token     String   @unique
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  createdAt DateTime @default(now())
}

model Teacher {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  employeeId    String   @unique
  department    String?

  classSubjects  ClassSubject[]
  classTeacherOf Class[]       @relation("ClassTeacher")
  attendances    Attendance[]
  assignments    Assignment[]
  grades         Grade[]
}

model Student {
  id            String   @id @default(cuid())
  userId        String   @unique
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  rollNumber    String
  classId       String
  class         Class    @relation(fields: [classId], references: [id])

  attendances   Attendance[]
  submissions   Submission[]
  grades        Grade[]

  @@unique([rollNumber, classId])
}

model AcademicYear {
  id        String   @id @default(cuid())
  name      String
  nameNe    String?
  startDate DateTime
  endDate   DateTime
  isCurrent Boolean  @default(false)

  classes     Class[]
  assignments Assignment[]
}

model Class {
  id              String       @id @default(cuid())
  grade           Int
  section         String
  academicYearId  String
  academicYear    AcademicYear @relation(fields: [academicYearId], references: [id])
  classTeacherId  String?
  classTeacher    Teacher?     @relation("ClassTeacher", fields: [classTeacherId], references: [id])

  students      Student[]
  classSubjects ClassSubject[]
  attendances   Attendance[]
  assignments   Assignment[]

  @@unique([grade, section, academicYearId])
}

model Subject {
  id       String  @id @default(cuid())
  code     String  @unique
  name     String
  nameNe   String?
  isActive Boolean @default(true)

  classSubjects ClassSubject[]
  assignments   Assignment[]
  grades        Grade[]
}

model ClassSubject {
  id        String   @id @default(cuid())
  classId   String
  class     Class    @relation(fields: [classId], references: [id], onDelete: Cascade)
  subjectId String
  subject   Subject  @relation(fields: [subjectId], references: [id])
  teacherId String?
  teacher   Teacher? @relation(fields: [teacherId], references: [id])

  @@unique([classId, subjectId])
}

model Attendance {
  id         String   @id @default(cuid())
  studentId  String
  student    Student  @relation(fields: [studentId], references: [id], onDelete: Cascade)
  classId    String
  class      Class    @relation(fields: [classId], references: [id])
  date       DateTime @db.Date
  status     String   // present, absent, late, excused
  markedById String
  markedBy   Teacher  @relation(fields: [markedById], references: [id])
  note       String?
  createdAt  DateTime @default(now())

  @@unique([studentId, date])
  @@index([classId, date])
}

model Assignment {
  id             String       @id @default(cuid())
  title          String
  titleNe        String?
  description    String?
  subjectId      String
  subject        Subject      @relation(fields: [subjectId], references: [id])
  classId        String
  class          Class        @relation(fields: [classId], references: [id])
  teacherId      String
  teacher        Teacher      @relation(fields: [teacherId], references: [id])
  academicYearId String
  academicYear   AcademicYear @relation(fields: [academicYearId], references: [id])
  dueDate        DateTime
  maxScore       Int          @default(100)
  type           String       @default("homework")
  createdAt      DateTime     @default(now())

  submissions Submission[]

  @@index([classId, dueDate])
}

model Submission {
  id           String     @id @default(cuid())
  assignmentId String
  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  studentId    String
  student      Student    @relation(fields: [studentId], references: [id], onDelete: Cascade)
  submittedAt  DateTime   @default(now())
  status       String     @default("submitted")
  content      String?
  fileUrl      String?
  score        Int?
  feedback     String?
  gradedAt     DateTime?

  @@unique([assignmentId, studentId])
}

model Grade {
  id             String  @id @default(cuid())
  studentId      String
  student        Student @relation(fields: [studentId], references: [id], onDelete: Cascade)
  subjectId      String
  subject        Subject @relation(fields: [subjectId], references: [id])
  teacherId      String
  teacher        Teacher @relation(fields: [teacherId], references: [id])
  assessmentType String
  term           String
  score          Float
  maxScore       Float
  percentage     Float
  letterGrade    String
  remarks        String?
  createdAt      DateTime @default(now())

  @@index([studentId, subjectId])
}

model GradingScale {
  id        String              @id @default(cuid())
  name      String
  isDefault Boolean             @default(false)
  entries   GradingScaleEntry[]
}

model GradingScaleEntry {
  id             String       @id @default(cuid())
  gradingScaleId String
  gradingScale   GradingScale @relation(fields: [gradingScaleId], references: [id], onDelete: Cascade)
  grade          String
  minPercentage  Float
  maxPercentage  Float
  gpa            Float
}
```

**Step 3: Set up Supabase and get connection string**

1. Go to https://supabase.com and create a free project
2. Copy the connection string from Project Settings > Database
3. Create `packages/backend/.env`:

```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
JWT_SECRET="your-secret-key-min-32-chars"
JWT_REFRESH_SECRET="your-refresh-secret-key-min-32-chars"
```

**Step 4: Run migrations**

```bash
npx prisma migrate dev --name init
# Expected: Migration applied successfully
```

**Step 5: Generate Prisma client**

```bash
npx prisma generate
```

**Step 6: Commit**

```bash
git add packages/backend/prisma
git commit -m "feat: add Prisma schema with all entities"
```

---

### Task 4: Set Up Frontend Package

**Files:**
- Create: `packages/frontend/` (via create-next-app)

**Step 1: Create Next.js app**

```bash
cd packages
npx create-next-app@14 frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

**Step 2: Install additional dependencies**

```bash
cd frontend
pnpm add zustand @tanstack/react-query axios date-fns clsx tailwind-merge lucide-react sonner
pnpm add -D @types/node
```

**Step 3: Initialize shadcn/ui**

```bash
npx shadcn@latest init
# Choose: Default style, Slate base color, CSS variables: yes
```

**Step 4: Add essential shadcn components**

```bash
npx shadcn@latest add button card input label form table dialog dropdown-menu toast tabs
```

**Step 5: Test frontend runs**

```bash
pnpm dev
# Expected: App running on http://localhost:3000
```

**Step 6: Commit**

```bash
git add packages/frontend
git commit -m "feat: add frontend package with Next.js 14 and shadcn/ui"
```

---

### Task 5: Implement JWT Authentication (Backend)

**Files:**
- Create: `packages/backend/src/utils/jwt.ts`
- Create: `packages/backend/src/utils/password.ts`
- Create: `packages/backend/src/middleware/auth.ts`
- Create: `packages/backend/src/routes/auth.routes.ts`
- Create: `packages/backend/src/controllers/auth.controller.ts`

**Step 1: Create JWT utilities**

Create `packages/backend/src/utils/jwt.ts`:

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' });
};

export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_SECRET) as TokenPayload;
};

export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, JWT_REFRESH_SECRET) as TokenPayload;
};
```

**Step 2: Create password utilities**

Create `packages/backend/src/utils/password.ts`:

```typescript
import bcrypt from 'bcryptjs';

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};
```

**Step 3: Create auth middleware**

Create `packages/backend/src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
```

**Step 4: Create auth controller**

Create `packages/backend/src/controllers/auth.controller.ts`:

```typescript
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';

const prisma = new PrismaClient();

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() },
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const refresh = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    const decoded = verifyRefreshToken(refreshToken);

    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const payload = { userId: decoded.userId, email: decoded.email, role: decoded.role };
    const newAccessToken = generateAccessToken(payload);

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        firstNameNe: true,
        lastNameNe: true,
      },
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

**Step 5: Create auth routes**

Create `packages/backend/src/routes/auth.routes.ts`:

```typescript
import { Router } from 'express';
import { login, refresh, logout, getMe } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
```

**Step 6: Update main index.ts to use routes**

Update `packages/backend/src/index.ts`:

```typescript
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:3000', credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

**Step 7: Test auth endpoints**

```bash
pnpm dev
# Test login (after seeding a user)
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@test.com","password":"password123"}'
```

**Step 8: Commit**

```bash
git add packages/backend/src
git commit -m "feat: implement JWT authentication"
```

---

### Task 6: Create Database Seed Script

**Files:**
- Create: `packages/backend/prisma/seed.ts`
- Modify: `packages/backend/package.json`

**Step 1: Create seed script**

Create `packages/backend/prisma/seed.ts`:

```typescript
import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@edunexus.com' },
    update: {},
    create: {
      email: 'admin@edunexus.com',
      passwordHash: adminPassword,
      role: UserRole.ADMIN,
      firstName: 'System',
      lastName: 'Admin',
      firstNameNe: 'प्रणाली',
      lastNameNe: 'प्रशासक',
    },
  });

  // Create academic year
  const academicYear = await prisma.academicYear.upsert({
    where: { id: 'ay-2081' },
    update: {},
    create: {
      id: 'ay-2081',
      name: '2081-2082',
      nameNe: '२०८१-२०८२',
      startDate: new Date('2024-04-14'),
      endDate: new Date('2025-04-13'),
      isCurrent: true,
    },
  });

  // Create subjects
  const subjects = [
    { code: 'MAT', name: 'Mathematics', nameNe: 'गणित' },
    { code: 'ENG', name: 'English', nameNe: 'अंग्रेजी' },
    { code: 'NEP', name: 'Nepali', nameNe: 'नेपाली' },
    { code: 'SCI', name: 'Science', nameNe: 'विज्ञान' },
    { code: 'SOC', name: 'Social Studies', nameNe: 'सामाजिक अध्ययन' },
  ];

  for (const subject of subjects) {
    await prisma.subject.upsert({
      where: { code: subject.code },
      update: {},
      create: subject,
    });
  }

  // Create grading scale
  const gradingScale = await prisma.gradingScale.upsert({
    where: { id: 'gs-cdc' },
    update: {},
    create: {
      id: 'gs-cdc',
      name: 'CDC Standard',
      isDefault: true,
      entries: {
        create: [
          { grade: 'A+', minPercentage: 90, maxPercentage: 100, gpa: 4.0 },
          { grade: 'A', minPercentage: 80, maxPercentage: 89.99, gpa: 3.6 },
          { grade: 'B+', minPercentage: 70, maxPercentage: 79.99, gpa: 3.2 },
          { grade: 'B', minPercentage: 60, maxPercentage: 69.99, gpa: 2.8 },
          { grade: 'C+', minPercentage: 50, maxPercentage: 59.99, gpa: 2.4 },
          { grade: 'C', minPercentage: 40, maxPercentage: 49.99, gpa: 2.0 },
          { grade: 'D', minPercentage: 30, maxPercentage: 39.99, gpa: 1.6 },
          { grade: 'E', minPercentage: 0, maxPercentage: 29.99, gpa: 0.0 },
        ],
      },
    },
  });

  console.log('Seed completed:', { admin: admin.email, academicYear: academicYear.name });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Step 2: Add seed script to package.json**

Add to `packages/backend/package.json`:

```json
{
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
}
```

**Step 3: Run seed**

```bash
npx prisma db seed
# Expected: Seed completed: { admin: 'admin@edunexus.com', academicYear: '2081-2082' }
```

**Step 4: Commit**

```bash
git add packages/backend/prisma/seed.ts packages/backend/package.json
git commit -m "feat: add database seed script"
```

---

### Task 7: Frontend Auth Store (Zustand)

**Files:**
- Create: `packages/frontend/src/store/authStore.ts`
- Create: `packages/frontend/src/lib/api.ts`

**Step 1: Create API client**

Create `packages/frontend/src/lib/api.ts`:

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  withCredentials: true,
});

let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/refresh`,
            { refreshToken }
          );
          setAccessToken(data.accessToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
```

**Step 2: Create auth store**

Create `packages/frontend/src/store/authStore.ts`:

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api, { setAccessToken } from '@/lib/api';

interface User {
  id: string;
  email: string;
  role: 'ADMIN' | 'TEACHER' | 'STUDENT';
  firstName: string;
  lastName: string;
  firstNameNe?: string;
  lastNameNe?: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: true,

      login: async (email: string, password: string) => {
        const { data } = await api.post('/auth/login', { email, password });
        setAccessToken(data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        set({ user: data.user, isAuthenticated: true, isLoading: false });
      },

      logout: async () => {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          await api.post('/auth/logout', { refreshToken }).catch(() => {});
        }
        setAccessToken(null);
        localStorage.removeItem('refreshToken');
        set({ user: null, isAuthenticated: false, isLoading: false });
      },

      checkAuth: async () => {
        try {
          const refreshToken = localStorage.getItem('refreshToken');
          if (!refreshToken) {
            set({ isLoading: false });
            return;
          }

          const { data: tokenData } = await api.post('/auth/refresh', { refreshToken });
          setAccessToken(tokenData.accessToken);

          const { data: userData } = await api.get('/auth/me');
          set({ user: userData, isAuthenticated: true, isLoading: false });
        } catch {
          localStorage.removeItem('refreshToken');
          set({ user: null, isAuthenticated: false, isLoading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

**Step 3: Commit**

```bash
git add packages/frontend/src/store packages/frontend/src/lib
git commit -m "feat: add auth store and API client"
```

---

### Task 8: Frontend Login Page

**Files:**
- Create: `packages/frontend/src/app/(auth)/login/page.tsx`
- Create: `packages/frontend/src/app/(auth)/layout.tsx`

**Step 1: Create auth layout**

Create `packages/frontend/src/app/(auth)/layout.tsx`:

```typescript
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8">
        {children}
      </div>
    </div>
  );
}
```

**Step 2: Create login page**

Create `packages/frontend/src/app/(auth)/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      const user = useAuthStore.getState().user;

      if (user?.role === 'ADMIN') router.push('/admin');
      else if (user?.role === 'TEACHER') router.push('/teacher');
      else router.push('/student');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">EduNexus</CardTitle>
        <CardDescription>Sign in to your account</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@edunexus.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

**Step 3: Test login flow**

```bash
# Start backend
cd packages/backend && pnpm dev

# Start frontend (new terminal)
cd packages/frontend && pnpm dev

# Open http://localhost:3000/login
# Login with admin@edunexus.com / admin123
```

**Step 4: Commit**

```bash
git add packages/frontend/src/app
git commit -m "feat: add login page"
```

---

### Task 9-20: Remaining Implementation Tasks

Due to length constraints, the following tasks follow the same pattern:

**Task 9:** Admin Dashboard Layout + Sidebar
**Task 10:** Admin User Management CRUD
**Task 11:** Admin Academic Year Management
**Task 12:** Admin Class Management
**Task 13:** Admin Subject Management
**Task 14:** Teacher Dashboard + Routes
**Task 15:** Attendance Marking Grid
**Task 16:** Grade Entry Table
**Task 17:** Assignment CRUD
**Task 18:** Student Dashboard
**Task 19:** Student Views (Attendance, Grades, Assignments)
**Task 20:** i18n Setup with next-intl
**Task 21:** Deploy to Vercel + Railway + Supabase

Each task follows the same structure:
1. Write failing test (if applicable)
2. Run test to verify it fails
3. Write minimal implementation
4. Run test to verify it passes
5. Commit

---

## Verification Checklist

### After Task 5 (Auth Complete)
```bash
# Backend running on 3001
curl http://localhost:3001/health
# Expected: {"status":"ok",...}

# Login test
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@edunexus.com","password":"admin123"}'
# Expected: {"user":{...},"accessToken":"...","refreshToken":"..."}

# Auth check
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer <ACCESS_TOKEN>"
# Expected: {"id":"...","email":"admin@edunexus.com","role":"ADMIN",...}
```

### After Task 8 (Frontend Login)
1. Open http://localhost:3000/login
2. Enter admin@edunexus.com / admin123
3. Should redirect to /admin dashboard

### After Task 13 (Admin Module Complete)
1. Login as admin
2. Create a new teacher user
3. Create an academic year
4. Create a class (Grade 5A)
5. Assign subjects to the class
6. Assign teacher to class-subjects

### After Task 17 (Teacher Module Complete)
1. Login as teacher
2. Mark attendance for a class
3. Create an assignment
4. Enter grades for students

### After Task 19 (Student Module Complete)
1. Login as student
2. View attendance calendar
3. View grades
4. Submit an assignment

### After Task 20 (i18n Complete)
1. Toggle language to Nepali
2. Verify all labels change
3. Check Nepali names display correctly

### E2E Smoke Test
```
1. Admin → Create academic year → Create class → Create subjects
2. Admin → Create teacher → Assign to class-subjects
3. Admin → Create student → Assign to class
4. Teacher → Mark attendance → Create assignment
5. Student → View attendance → Submit assignment
6. Teacher → Grade submission
7. Student → View grade
```

---

## Deployment Steps

### 1. Supabase (Database)
1. Go to https://supabase.com
2. Create new project (free tier)
3. Copy connection string from Settings → Database
4. Run: `DATABASE_URL="..." npx prisma migrate deploy`
5. Run: `DATABASE_URL="..." npx prisma db seed`

### 2. Railway (Backend)
1. Go to https://railway.app
2. Connect GitHub repo
3. Select `packages/backend` as root directory
4. Add environment variables:
   - DATABASE_URL
   - JWT_SECRET
   - JWT_REFRESH_SECRET
   - CORS_ORIGIN (your Vercel URL)
5. Deploy

### 3. Vercel (Frontend)
1. Go to https://vercel.com
2. Import GitHub repo
3. Select `packages/frontend` as root directory
4. Add environment variable:
   - NEXT_PUBLIC_API_URL (your Railway URL)
5. Deploy

---

## Environment Variables

### Backend (.env)
```env
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres
JWT_SECRET=your-secret-key-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-characters
CORS_ORIGIN=https://your-app.vercel.app
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app/api
```

---

## Execution: Parallel Session

**Chosen approach:** Open a new Claude Code session to execute this plan.

### Setup Instructions

1. **Create the project directory:**
   ```bash
   mkdir -p /home/aayushms/work/pet_projects/ed_tech_mvp
   cd /home/aayushms/work/pet_projects/ed_tech_mvp
   ```

2. **Open a new Claude Code session in that directory:**
   ```bash
   cd /home/aayushms/work/pet_projects/ed_tech_mvp
   claude
   ```

3. **Start the session with this prompt:**
   ```
   Use superpowers:executing-plans to implement the plan at:
   /home/aayushms/.claude/plans/composed-coalescing-matsumoto.md

   Start from Task 1 and work through each task sequentially.
   ```

4. **The new session will:**
   - Read the plan file
   - Execute tasks one by one
   - Commit after each task
   - Pause at checkpoints for review

### Checkpoint Reviews

After completing these milestones, review before continuing:
- **After Task 5:** Auth system complete - test login
- **After Task 8:** Frontend login working - test E2E auth
- **After Task 13:** Admin module complete - test CRUD
- **After Task 17:** Teacher module complete - test attendance/grades
- **After Task 19:** Student module complete - test full flow
- **After Task 21:** Deployed - test production
