# Phased Implementation Plan (`IMPLEMENTATION_PLAN.md`)

## Phase 1: Reverse-Engineering & Documentation (Completed)
1. Explore `https://storytribeapp.com` and `https://app.storytribeapp.com` (v3.4.6) via Playwright, capturing 42 full-resolution screenshots across public, auth, workspace, 6-mode editor, tool drawers, modals, mobile layouts, and edge states.
2. Produce `EXPLORATION_COVERAGE.md`, `ADR.md`, `PRD.md`, `SPEC.md`, `ARCHITECTURE_AND_DATA_MODEL.md`, `IMPLEMENTATION_PLAN.md`, `TASK_BACKLOG.md`, `ACCEPTANCE_CRITERIA.md`, and `FEATURE_PARITY.md`.

## Phase 2: Project Foundation, Dual-DB Prisma 7 & Invite-Only Auth
1. Configure `package.json`, `tsconfig.json`, `next.config.mjs`, `.gitignore` (excluding `.cred`, `.env`, `dev.db`), `.env.example`, `Dockerfile`, and `docker-compose.yml`.
2. Define `prisma/schema.prisma` (SQLite dev) and `prisma/schema.postgres.prisma` (PostgreSQL prod) with all 15+ models (`User`, `Account`, `Session`, `VerificationToken`, `AccountInvitation`, `AuditLog`, `Workspace`, `WorkspaceMember`, `Project`, `Stage`, `ProjectGuest`, `Comment`, `ProjectElement`, `PropertyDefinition`, `VideoProject`, `AiGeneration`, `SavedItem`, `UserFollow`, `Notification`) and run initial migration.
3. Implement `src/lib/prisma.ts` (dual runtime adapter selection: `@prisma/adapter-better-sqlite3` and `@prisma/adapter-pg`).
4. Implement `src/lib/account-admission/` (`token.ts`, `audit.ts`, `invitations.ts`) and `scripts/bootstrap-admin.ts` (`npm run bootstrap:admin`).
5. Implement `src/lib/auth.ts` (NextAuth v4 `CredentialsProvider` + JWT session enrichment with `id`, `role`, `username`, `aiCredits`, `plan`) and route handlers (`/api/auth/[...nextauth]`, `/api/invitations/*`, `/api/admin/invitations/*`, `/api/admin/audit-logs`).

## Phase 3: Domain Catalog, API Layer & App Shell
1. Build the deterministic StoryTribe SVG illustration catalog (`src/lib/catalog/storytribe-assets.ts`):
   - Customizable Character Builder rig generator (8 poses, 8 expressions, 8 outfits, 8 hair styles, 6 skin tones, 4 view angles: Front, 3/4, Side, Back, custom clothing/hair colors, horizontal flip).
   - Built-in Props, Scene Backgrounds, Icons, Speech/Thought Bubbles, Arrows, and Camera Viewfinder Frames.
   - Default Shot Property definitions (`visualdetail`, `dialogue`, `cameraangle`, `shotsize`, `movement`).
2. Implement all StoryTribe REST API endpoints (`/api/projects/*`, `/api/elements/*`, `/api/properties/*`, `/api/workspaces/*`, `/api/ai/generate`, `/api/profile`, `/api/connections`, `/api/saved`, `/api/notifications`, `/api/share/[token]`).
3. Build Public Marketing Pages (`/`, `/features`, `/pricing`, `/help`), Auth & Invite Pages (`/login-signup`, `/forgotten-password`, `/invite/[token]`), Admin Governance Pages (`/admin/invitations`, `/admin/audit-logs`), and the Authenticated `/app/*` Workspace Shell (`Sidebar`, `/app/dashboard`, `/app/create`, `/app/projects`, `/app/shared`, `/app/elements`, `/app/properties`, `/app/ai-history`, `/app/workspace/*`, `/app/profile`, `/app/inspiration`, `/app/saved`, `/app/connections`, `/app/notifications`, `/app/settings`).

## Phase 4: 6-Mode Storyboard Editor, Canvas Engine, Video NLE & Export
1. Implement `EditorContext` with 50-step undo/redo history, keyboard shortcuts, and automatic/manual cloud save (`PUT /api/projects/[id]`).
2. Implement all 6 Editor Modes in `/app/editor/[projectid]` and `/m/editor/[projectid]`:
   - `Story Bible` (`bible`): Cover palette picker, title, `Summarise with AI` synopsis, `@Element` cards.
   - `Script` (`writer`): Scene-grouped screenplay & shot script editor with `AI Script`, `Import script`, and `@Elements`.
   - `Storyboard` (`grid`): Multi-column (`2..8` + `Compact`) visual storyboard grid with `@element`/`#scene` filter, shot cards, property badges, and `✨ Generate`.
   - `Canvas` (`canvas`): Full interactive 2D stage with Left Tool Rail (`Select`, `Tribe AI`, `Saved Elements`, `Search Assets`, `Character Builder`, `Sketch / Draw`, `Comment Pin`, `Create` shapes/bubbles/frames/upload), Right Inspector (`Script`, `Canvas`, `Layers`, `Comments`), and Bottom Zoom/Pan/Shortcuts toolbar.
   - `Table` (`table`): Spreadsheet shot list grouped by scene with inline editing and custom property columns.
   - `Video` (`video`): Multi-track Animatic NLE Timeline Editor with video clips, shot frames, transition selectors (`none`, `fade`, `dissolve`, `wipe`), voiceover recording/TTS lane, background music synthesizer lane, interactive playback, and video export.
3. Implement `Share project` modal, `Present` fullscreen mode, and `Export` modal (all 6 layouts across PDF, PPTX, PNG, CSV, JSON, and WebM).

## Phase 5: Verification, Automated Testing & Production Build
1. Run unit/integration tests covering invitation token hashing, single-use redemption, revocation, rotation, audit logs, and project/editor operations.
2. Run Playwright E2E tests verifying zero dummy data on fresh DB, CLI admin bootstrap, invite redemption, RBAC enforcement, project creation, all 6 editor modes, canvas authoring, export, and public sharing.
3. Verify `npm run build` completes with zero TypeScript or Next.js errors.
