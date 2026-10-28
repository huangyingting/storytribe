# Engineering Task Backlog (`TASK_BACKLOG.md`)

| ID | Category | Task Title | Priority | Dependencies | Status |
|----|----------|------------|----------|--------------|--------|
| `EXP-01` | Exploration | Reverse-engineer `storytribeapp.com` & `app.storytribeapp.com` v3.4.6 bundles | P0 | None | Done |
| `EXP-02` | Exploration | Capture 42 Playwright screenshots across all public, auth, `/app/*`, and 6 editor modes | P0 | `EXP-01` | Done |
| `DOC-01` | Documentation | Create `EXPLORATION_COVERAGE.md`, `ADR.md`, `PRD.md`, `SPEC.md` | P0 | `EXP-02` | Done |
| `DOC-02` | Documentation | Create `ARCHITECTURE_AND_DATA_MODEL.md`, `IMPLEMENTATION_PLAN.md`, `TASK_BACKLOG.md`, `ACCEPTANCE_CRITERIA.md`, `FEATURE_PARITY.md` | P0 | `DOC-01` | Done |
| `FND-01` | Foundation | Initialize Next.js 16, TypeScript, Tailwind CSS, Prisma 7 (`sqlite` + `pg` adapters), `.gitignore`, `.env.example`, Docker config | P0 | `DOC-02` | Pending |
| `FND-02` | Database | Author `prisma/schema.prisma` & `prisma/schema.postgres.prisma` and apply initial SQLite migration | P0 | `FND-01` | Pending |
| `AUTH-01` | Security | Implement `src/lib/account-admission/` (SHA-256 tokens, single-use redemption, revocation, rotation, `AuditLog`) | P0 | `FND-02` | Pending |
| `AUTH-02` | Security | Implement `scripts/bootstrap-admin.ts` CLI tool and NextAuth v4 JWT session config (`src/lib/auth.ts`) | P0 | `AUTH-01` | Pending |
| `AUTH-03` | Security | Build `/login-signup`, `/forgotten-password`, `/invite/[token]`, `/admin/invitations`, and `/admin/audit-logs` | P0 | `AUTH-02` | Pending |
| `API-01` | Backend API | Build `/api/projects`, `/api/projects/[id]`, `/api/projects/[id]/duplicate`, `/api/projects/[id]/share`, `/api/projects/[id]/comments` | P0 | `AUTH-02` | Pending |
| `API-02` | Backend API | Build `/api/elements`, `/api/properties`, `/api/workspaces`, `/api/ai/generate`, `/api/profile`, `/api/connections`, `/api/saved`, `/api/notifications` | P0 | `API-01` | Pending |
| `UI-01` | Public UI | Build marketing pages (`/`, `/features`, `/pricing`, `/help`) and public share pages (`/share/[token]`, `/v/[shareToken]`, `/[username]`) | P1 | `API-01` | Pending |
| `UI-02` | Workspace UI | Build `/app/*` sidebar layout and all 14 workspace pages (`dashboard`, `create`, `projects`, `shared`, `elements`, `properties`, `ai-history`, `workspace/*`, `profile`, `inspiration`, `saved`, `connections`, `notifications`, `settings`) | P0 | `API-02` | Pending |
| `ED-01` | Editor Core | Build `EditorContext` with 50-step Undo/Redo, header bar, Present mode, Share modal, and 6-layout Export modal | P0 | `API-01` | Pending |
| `ED-02` | Editor Modes | Implement `Story Bible`, `Script` Writer, `Storyboard` Grid, and `Table` Shot List modes | P0 | `ED-01` | Pending |
| `ED-03` | Canvas Engine | Implement `Canvas` mode with Left Tool Rail (`Select`, `Tribe AI`, `Elements`, `Search Assets`, `Character Builder`, `Sketch`, `Comment`, `Create`) and Right Panel (`Script`, `Canvas`, `Layers`, `Comments`) | P0 | `ED-01` | Pending |
| `ED-04` | Video Animatic | Implement `Video` Animatic NLE Timeline Editor (frames, transitions, voiceover/TTS, procedural music, playback, WebM export) & `/m/editor/[projectid]` | P0 | `ED-01` | Pending |
| `QA-01` | Verification | Run unit/integration tests, Playwright E2E test suite, and production `npm run build` verification | P0 | `ED-04`, `UI-02` | Pending |
