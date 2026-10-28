# StoryTribe — Visual Storyboarding, Scriptwriting & Animatic Studio

A production-ready full-stack web application replicating the feature set, visual identity, 6-mode storyboard editor, workspace collaboration, and export capabilities of **StoryTribe (v3.4.6)**, enhanced with **Invite-Only Account Admission**, single-use expiring tokens, role-based access control (`ADMIN` / `USER`), token revocation/rotation, and immutable audit logging.

---

## Architecture & Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Authentication**: NextAuth v4 (`CredentialsProvider` + JWT session strategy + `bcryptjs` cost-12 password hashing)
- **Database & ORM**: Prisma 7 with dual-database support:
  - **Local Development**: SQLite (`prisma/schema.prisma`, `@prisma/adapter-better-sqlite3`)
  - **Production**: PostgreSQL (`prisma/schema.postgres.prisma`, `@prisma/adapter-pg`)
- **Zero Dummy Data Policy**: Fresh database migrations create an empty schema with zero pre-seeded demo users or fake projects. The first administrator is provisioned via `npm run bootstrap:admin`.

---

## Documentation Suite (`docs/`)

1. [`docs/EXPLORATION_COVERAGE.md`](docs/EXPLORATION_COVERAGE.md) — Playwright exploration log & 42 screenshots (`screenshots/`)
2. [`docs/ADR.md`](docs/ADR.md) — Architecture Decision Records (ADR-001 through ADR-008)
3. [`docs/PRD.md`](docs/PRD.md) — Product Requirements Document
4. [`docs/SPEC.md`](docs/SPEC.md) — Functional & Technical Specification
5. [`docs/ARCHITECTURE_AND_DATA_MODEL.md`](docs/ARCHITECTURE_AND_DATA_MODEL.md) — System Architecture & 16-Model Prisma Schema
6. [`docs/IMPLEMENTATION_PLAN.md`](docs/IMPLEMENTATION_PLAN.md) — Phased Implementation Plan
7. [`docs/TASK_BACKLOG.md`](docs/TASK_BACKLOG.md) — Engineering Task Backlog
8. [`docs/ACCEPTANCE_CRITERIA.md`](docs/ACCEPTANCE_CRITERIA.md) — Testable Acceptance Criteria
9. [`docs/FEATURE_PARITY.md`](docs/FEATURE_PARITY.md) — Feature Parity Matrix

---

## Quick Start (Local SQLite Development)

```bash
# 1. Install dependencies
npm install

# 2. Apply SQLite migrations and generate Prisma Client
npm run db:migrate

# 3. Bootstrap the first ADMIN invitation link (zero dummy accounts)
npm run bootstrap:admin -- --email admin@example.com --role ADMIN

# 4. Start the development server
npm run dev
```

Open the printed `/invite/<token>` link in your browser to redeem the single-use admin invitation and create your administrator account.

---

## Testing & Verification

```bash
# Run unit tests (invite-only admission, single-use redemption, revocation, rotation, screenplay parser, exporter)
npm run test:unit

# Run Playwright End-to-End tests
npm run test:e2e

# Production build check
npm run build
```
