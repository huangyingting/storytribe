# Architecture Decision Records (ADR)

## ADR-001: Next.js 16 App Router Full-Stack Architecture

- **Status**: Accepted
- **Context**: StoryTribe (`storytribeapp.com`) splits its marketing site (Webflow) and web application (`app.storytribeapp.com`, Next.js Pages Router + Firebase backend). We need a self-contained, production-ready full-stack web application that replicates both the public marketing/share experience and the complete `/app/*` workspace and `/app/editor/[projectid]` multi-mode storyboard editor, without external SaaS lock-in.
- **Decision**: Use **Next.js 16 (App Router)** with React 19 and TypeScript (`strict: true`), combining Server Components for fast initial renders and RBAC route protection with rich interactive Client Components for the 6-mode Storyboard Editor, Canvas engine, and Video Animatic NLE.
- **Consequences**:
  - Unified deployment unit (`npm run build && npm run start` or Docker container) serving marketing pages, auth/invitation flows, REST API handlers (`/api/*`), and the interactive SPA workspace.
  - Shared TypeScript domain types between Prisma database repositories, API routes, and client state.

---

## ADR-002: NextAuth v4 JWT Session + Invite-Only Account Admission & Audit Governance

- **Status**: Accepted
- **Context**: The application requires strict invite-only registration with single-use, expiring invitation codes, role-based access control (`USER`, `ADMIN`), revocation, rotation, CLI bootstrap for the initial administrator, and comprehensive `AuditLog` tracking (referencing `../Arcade/docs/NEXTAUTH_INVITE_ONLY_SPEC.md`), with **zero dummy data or pre-seeded demo user accounts**.
- **Decision**:
  1. Use **NextAuth v4 (`next-auth`)** with `CredentialsProvider` (`email` + `password` hashed with `bcryptjs`, cost factor 12) and `session.strategy = "jwt"`.
  2. Disable open public sign-up: creating a new user account requires a valid, unrevoked, unexpired, single-use `AccountInvitation` token (`/invite/[token]` or invitation code on `/login-signup?mode=signup&code=...`).
  3. Store only a **SHA-256 hex digest (`tokenHash`)** of the 256-bit cryptographically random raw invitation token (`crypto.randomBytes(32).toString("base64url")`) in the database; return the raw token once to the issuing `ADMIN`.
  4. Enforce atomic single-use redemption inside `prisma.$transaction()`: verify `status === "PENDING"` and `expiresAt > now`, create the `User` with `invitation.role`, mark the invitation `ACCEPTED`, and write `INVITATION_REDEEMED` + `USER_REGISTERED` entries to `AuditLog`.
  5. Provide `npm run bootstrap:admin -- --email <email> [--role ADMIN] [--expires-hours 72]` (`scripts/bootstrap-admin.ts`) to issue the initial admin invitation without seeding dummy users.
- **Consequences**:
  - Zero unauthorized signups; full cryptographic security for invitation links; complete auditability in `/admin/invitations` and `/admin/audit-logs`.

---

## ADR-003: Prisma 7 Dual-Database Adapter Architecture (SQLite Local Dev + PostgreSQL Production)

- **Status**: Accepted
- **Context**: The system must run out-of-the-box in local development using SQLite while supporting PostgreSQL in production deployments, following the Prisma 7 driver-adapter pattern proven in `../Arcade`.
- **Decision**:
  - Use **Prisma 7 (`@prisma/client` + `prisma`)** with `@prisma/adapter-better-sqlite3` (`better-sqlite3`) when `DATABASE_URL` begins with `file:` (default local development `file:./dev.db`), and `@prisma/adapter-pg` (`pg`) when `DATABASE_URL` uses `postgresql://` or `postgres://`.
  - Maintain `prisma/schema.prisma` (SQLite provider with initial migration in `prisma/migrations/`) and `prisma/schema.postgres.prisma` (PostgreSQL provider for production deployments), with identical models and field definitions.
- **Consequences**:
  - Zero-dependency local setup (`npx prisma migrate deploy`) with seamless PostgreSQL scalability in Docker/cloud environments.

---

## ADR-004: Zero-Dummy-Data Policy & Real Persistent User/Project/Asset State

- **Status**: Accepted
- **Context**: The prompt explicitly requires: *"Please do not use dummy data or create demo user accounts. The goal of this project is to build a production-ready application that fully replicates the original website."*
- **Decision**:
  - The database starts completely clean (zero pre-seeded users, zero fake projects, zero mock notifications).
  - Every user account is created exclusively via the invite-only admission flow (`bootstrap-admin.ts` or `/api/admin/invitations` -> `/invite/[token]`).
  - Every workspace, storyboard project, scene, shot (`Stage`), canvas object, custom `@Element`, custom shot property definition, comment thread, AI generation record, and video animatic timeline is created by authenticated users and persisted in the database via real CRUD API routes.
  - Built-in vector illustration catalogs (StoryTribe customizable characters, poses, outfits, expressions, props, backgrounds, speech bubbles, and frames) are provided as deterministic SVG asset libraries (`src/lib/catalog/`) so users can immediately compose rich storyboards without external network dependencies.
- **Consequences**:
  - True production readiness; all dashboards, project lists, and editors reflect authentic user-created database state.

---

## ADR-005: 6-Mode Storyboard Editor State & Undo/Redo Engine

- **Status**: Accepted
- **Context**: StoryTribe's core differentiator is its unified 6-mode editor (`/app/editor/[projectid]`): `Story Bible`, `Script`, `Storyboard` Grid, `Canvas`, `Table` Shot List, and `Video` Animatic Timeline, backed by a 50-step undo/redo stack (`doc` slice) and automatic cloud persistence.
- **Decision**:
  - Implement a structured client Editor Store (`useEditorStore` in `src/components/editor/EditorContext.tsx`) that manages:
    - Undo/redo history stack (limit 50 snapshots) covering `project`, `scenes`, `stages` (shots), and `objects` (canvas layers).
    - Active `viewMode` (`"bible" | "writer" | "grid" | "canvas" | "table" | "video"`), `activeMenu` (`"select" | "tribe-ai" | "saved-items" | "search" | "add-characters" | "sketch" | "comment" | "create"`), `rightPanelTab` (`"script" | "canvas" | "layers" | "comments"`), `selectedStageId`, `selectedObjectIds`, zoom/pan state, and debounced + explicit auto-save to `PUT /api/projects/[id]`.
- **Consequences**:
  - Instant mode switching with zero data loss; edits made to a shot's script or properties in `Script`, `Storyboard`, `Canvas`, or `Table` mode immediately reflect across all other modes and the `Video` animatic timeline.

---

## ADR-006: Interactive 2D Vector/Raster Canvas Engine, Character Builder & Real Multi-Format Export

- **Status**: Accepted
- **Context**: In `Canvas` mode, users compose storyboard frames using customizable characters (pose, expression, outfit, hair, skin tone, view angle, flip), props, scene backgrounds, geometric shapes, speech/thought bubbles, freehand sketching (`Normal`, `Inertia`, `Dashed`, `Dotted`), uploaded images, and deterministic AI-synthesized SVG/Canvas artwork, then export in 6 layouts (`One shot per page`, `Storyboard, 3 per page`, `Grid overview`, `Images only`, `Screenplay`, `Shot list / Table`).
- **Decision**:
  - Build a high-DPI HTML5 SVG/Canvas composite stage (`CanvasStage.tsx`) supporting drag, resize, rotate, z-index layer ordering, lock/hide, group/ungroup, multi-select, freehand pointer drawing (`PointerEvents` path smoothing), and anchored `{x, y}` comment pins.
  - Implement real client/server export engines (`src/lib/export/`) that generate downloadable **PDF** (multi-layout printable storyboard/screenplay/table), **PPTX-compatible HTML/XML presentation deck**, **PNG** (rendered high-res frame images), **CSV** (production shot list), **JSON** (full project archive), and **WebM/Video** (synthesized animatic video from timeline frames + audio/TTS).
- **Consequences**:
  - Every tool button, character customizer control, sketch brush, and export preset produces real, persistent, downloadable output.
