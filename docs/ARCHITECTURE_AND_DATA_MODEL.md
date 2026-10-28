# System Architecture & Relational Data Model

## 1. High-Level System Architecture

```
┌────────────────────────────────────────────────────────────────────────────┐
│                        Browser Client (React 19)                           │
│                                                                            │
│  ┌──────────────────────┐  ┌──────────────────────┐  ┌──────────────────┐  │
│  │ Public & Share Views │  │ Workspace App Shell  │  │ 6-Mode Editor    │  │
│  │ /, /features, /help  │  │ /app/dashboard,      │  │ Story Bible,     │  │
│  │ /pricing, /share/*   │  │ /app/projects,       │  │ Script, Grid,    │  │
│  │ /v/*, /[username]    │  │ /app/elements, etc.  │  │ Canvas, Table,   │  │
│  └──────────┬───────────┘  └──────────┬───────────┘  │ Video Animatic   │  │
│             │                         │              └────────┬─────────┘  │
│             └─────────────────────────┼───────────────────────┘            │
│                                       ▼                                    │
│                EditorContext (50-step Undo/Redo + Auto-Save)               │
└───────────────────────────────────────┬────────────────────────────────────┘
                                        │ HTTPS / JSON REST
                                        ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                     Next.js 16 App Router Server                           │
│                                                                            │
│  ┌─────────────────────────────────┐  ┌─────────────────────────────────┐  │
│  │ NextAuth v4 + Account Admission │  │ StoryTribe Domain API Handlers  │  │
│  │ - JWT Session + RBAC (ADMIN)    │  │ - /api/projects/[id] (Sync)     │  │
│  │ - Single-Use SHA-256 Invites    │  │ - /api/elements, /api/properties│  │
│  │ - Revocation & Token Rotation   │  │ - /api/ai/generate, /api/share  │  │
│  │ - Security Audit Logger         │  │ - /api/workspaces, /api/profile │  │
│  └─────────────────┬───────────────┘  └─────────────────┬───────────────┘  │
│                    └──────────────────┬─────────────────┘                  │
│                                       ▼                                    │
│             Prisma 7 Client (Driver Adapter Runtime Selection)             │
│        ┌──────────────────────────────┴──────────────────────────────┐     │
│        ▼                                                             ▼     │
│  @prisma/adapter-better-sqlite3                             @prisma/adapter-pg
│  Local Dev SQLite (file:./dev.db)                           Production PostgreSQL
└────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Complete Prisma Relational Data Model

### 2.1 Identity, Invite-Only Admission & Audit Models
1. **`User`**:
   - `id` (CUID PK), `name`, `username` (unique), `email` (unique, lowercase), `emailVerified`, `image`, `bio`, `passwordHash` (`bcryptjs`), `role` (`"USER" | "ADMIN"`, default `"USER"`), `hasCompletedOnboarding`, `aiCredits` (default 100), `plan` (`"FREE" | "CREATOR_PRO" | "STUDIO"`), `notificationPrefsJson`, `createdAt`, `updatedAt`.
2. **`Account`**, **`Session`**, **`VerificationToken`**:
   - Standard NextAuth v4 adapter tables.
3. **`AccountInvitation`**:
   - `id` (CUID PK), `email` (indexed), `tokenHash` (unique SHA-256 hex digest), `role` (`"USER" | "ADMIN"`), `status` (`"PENDING" | "ACCEPTED" | "REVOKED" | "EXPIRED"`), `expiresAt`, `acceptedAt`, `revokedAt`, `notes`, `invitedById` (`-> User.id`), `acceptedByUserId` (`-> User.id`, unique), `createdAt`, `updatedAt`.
4. **`AuditLog`**:
   - `id` (CUID PK), `action` (indexed), `actorId` (`-> User.id`), `actorEmail`, `targetType`, `targetId`, `details` (JSON string), `ipAddress`, `userAgent`, `createdAt` (indexed).

### 2.2 Workspace & Collaboration Models
5. **`Workspace`**:
   - `id` (CUID PK), `name`, `slug` (unique), `description`, `avatarColor`, `ownerId` (`-> User.id`), `defaultWidth` (1920), `defaultHeight` (1080), `createdAt`, `updatedAt`.
6. **`WorkspaceMember`**:
   - `id` (CUID PK), `workspaceId` (`-> Workspace.id`), `userId` (`-> User.id`), `role` (`"OWNER" | "ADMIN" | "MEMBER" | "VIEWER"`), `createdAt`. Unique on `[workspaceId, userId]`.

### 2.3 Storyboard Project, Scenes, Shots & Canvas Layer Models
7. **`Project`**:
   - `id` (CUID PK)
   - `title` (default `"Untitled Storyboard"`)
   - `synopsis` (Story Bible synopsis text)
   - `coverImage` (optional cover image URL/data)
   - `coverPalette` (default `"aura-warm"`, Story Bible header theme)
   - `ownerId` (`-> User.id`, indexed)
   - `workspaceId` (`-> Workspace.id`, nullable, indexed)
   - `width` (Int, default `1920`), `height` (Int, default `1080`)
   - `annotationFieldsJson` (JSON array of active shot property keys: `["visualdetail", "dialogue", "cameraangle", "shotsize", "movement"]`)
   - `scenesJson` (JSON array of ordered scenes: `[{ id, title, description, shotIds }]`)
   - `stageOrderJson` (JSON array of ordered stage IDs: `["stage-1", ...]`)
   - `shareToken` (unique 8-char alphanumeric token for `/share/[token]`)
   - `isPublic` (Boolean, default `false`)
   - `shareAccess` (`"off" | "view" | "comment"`, default `"off"`)
   - `isPublishedToCommunity` (Boolean, default `false`)
   - `likesCount` (Int, default `0`)
   - `createdAt`, `updatedAt` (indexed)
8. **`Stage`** (Individual Storyboard Shot / Frame):
   - `id` (CUID PK)
   - `projectId` (`-> Project.id` onDelete Cascade, indexed)
   - `title` (Shot title, e.g., `"Establishing Shot"`)
   - `sortOrder` (Int)
   - `bkgdColor` (default `"#ffffff"`)
   - `width` (Int, default `1920`), `height` (Int, default `1080`)
   - `annotationsJson` (JSON map of shot property values: `{ visualdetail, dialogue, cameraangle, shotsize, movement, ...custom }`)
   - `scriptBlocksJson` (JSON array of screenplay blocks: `[{ id, type: "action"|"character"|"dialogue"|"parenthetical"|"transition", text }]`)
   - `objectsJson` (JSON array of canvas objects on this stage: `[{ id, type, name, x, y, width, height, rotation, flipX, flipY, opacity, locked, visible, zIndex, props }]`)
   - `groupsJson` (JSON map of grouped object IDs)
   - `thumbnailData` (optional SVG/PNG data URL preview)
   - `createdAt`, `updatedAt`
9. **`ProjectGuest`**:
   - `id` (CUID PK), `projectId` (`-> Project.id`), `email`, `userId` (`-> User.id`, nullable), `permission` (`"VIEW" | "COMMENT" | "EDIT"`), `createdAt`. Unique on `[projectId, email]`.
10. **`Comment`**:
    - `id` (CUID PK), `projectId` (`-> Project.id` onDelete Cascade), `stageId` (nullable), `authorId` (`-> User.id`, nullable), `authorName`, `content`, `x` (Float, nullable canvas pin X%), `y` (Float, nullable canvas pin Y%), `resolved` (Boolean, default `false`), `parentId` (nullable reply thread), `createdAt`, `updatedAt`.

### 2.4 Reusable Elements, Custom Shot Properties, AI & Video Animatics
11. **`ProjectElement`** (`@Character`, `@Prop`, `@Background`):
    - `id` (CUID PK), `ownerId` (`-> User.id`), `projectId` (`-> Project.id`, nullable), `workspaceId` (`-> Workspace.id`, nullable), `name` (e.g. `"Barista Maya"`), `handle` (e.g. `"@barista-maya"`), `category` (`"CHARACTER" | "PROP" | "BACKGROUND"`), `description`, `svgData` (vector/rig configuration JSON or SVG string), `createdAt`, `updatedAt`.
12. **`PropertyDefinition`**:
    - `id` (CUID PK), `ownerId` (`-> User.id`), `workspaceId` (`-> Workspace.id`, nullable), `key` (slug, e.g. `"cameraangle"`), `label` (e.g. `"Camera Angle"`), `type` (`"text" | "select" | "multiselect" | "number" | "checkbox" | "person" | "media"`), `category` (`"Camera & Lens" | "Production" | "Story & Script" | "Custom"`), `optionsJson` (JSON array of select choices with colors), `isDefault` (Boolean), `createdAt`, `updatedAt`.
13. **`VideoProject`** (Animatic NLE Timeline state):
    - `id` (CUID PK), `projectId` (`-> Project.id`, unique, onDelete Cascade), `ownerId` (`-> User.id`), `framesJson` (`[{ frameId, duration, transition }]`), `settingsJson` (`{ defaultDuration, transition, resolution, fps, musicVolume }`), `voiceTracksJson` (`[{ id, name, startTime, duration, volume, script, voiceId, audioDataUrl }]`), `audioTracksJson` (`[{ id, name, startTime, duration, volume, loop, laneIndex, sourceUrl }]`), `videoClipsJson` (`[{ id, name, startTime, duration, sourceUrl }]`), `shareToken` (unique), `isPublic` (Boolean), `createdAt`, `updatedAt`.
14. **`AiGeneration`**:
    - `id` (CUID PK), `userId` (`-> User.id`), `projectId` (nullable), `stageId` (nullable), `generationType` (`"IMAGE" | "SCRIPT" | "SYNOPSIS" | "VOICEOVER"`), `prompt`, `style`, `model`, `aspectRatio`, `creditsUsed` (Int), `resultData` (SVG/JSON output), `createdAt`.
15. **`SavedItem`**, **`UserFollow`**, **`Notification`**:
    - Persist user bookmarks (`/app/saved`), creator connections (`/app/connections`), and in-app activity notifications (`/app/notifications`).
