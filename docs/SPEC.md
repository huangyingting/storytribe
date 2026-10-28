# Technical & Functional Specification (`SPEC.md`)

## 1. System Routes & Navigation Specification

### 1.1 Public & Marketing Routes
| Route | Access | Description |
|-------|--------|-------------|
| `/` | Public | Marketing landing page with hero, interactive preview, feature sections, pricing summary, and CTA |
| `/features` | Public | Detailed breakdown of Story Bible, Script Writer, Storyboard Grid, 2D Canvas, Shot Table, and Animatic Video |
| `/pricing` | Public | Plan comparison (`Free`, `Creator Pro`, `Studio`), monthly/yearly toggle, and FAQ |
| `/help` | Public | Documentation articles, workflow tutorials, and keyboard shortcuts guide |
| `/share/[token]` | Public (Token) | Public/shared storyboard presentation & review page (Grid, Slideshow, Script, and Comments if `shareAccess === "comment"`) |
| `/v/[shareToken]` | Public (Token) | Shared Video Animatic player page |
| `/[username]` | Public | Public creator profile showcasing published storyboards |

### 1.2 Authentication, Invitation & Admin Governance Routes
| Route | Access | Description |
|-------|--------|-------------|
| `/login-signup` | Public | Sign-in form (`email`, `password`) and Invite-Only Sign-up tab (`code`, `name`, `email`, `password`) |
| `/forgotten-password` | Public | Password recovery request form with security audit logging |
| `/invite/[token]` | Public (Token) | Dedicated single-use invitation acceptance & account creation page |
| `/admin/invitations` | `ADMIN` only | Invitation management dashboard: create invite, copy raw link, filter by status, revoke, or rotate |
| `/admin/audit-logs` | `ADMIN` only | Paginated, filterable security and invitation audit log viewer |

### 1.3 Authenticated Workspace & App Routes (`/app/*`)
| Route | Access | Description |
|-------|--------|-------------|
| `/app/dashboard` | `USER` / `ADMIN` | Personalized welcome header, quick-create actions, recent projects, and workspace overview |
| `/app/create` | `USER` / `ADMIN` | Project creation hub: Blank Storyboard (aspect ratio & custom px), AI Script-to-Storyboard, Import Script, Templates |
| `/app/projects` | `USER` / `ADMIN` | Full project library with search, workspace filter, sort (Last updated, Created, A–Z), grid/list toggle, rename/duplicate/delete |
| `/app/shared` | `USER` / `ADMIN` | Storyboard projects shared with the current user via guest invite |
| `/app/elements` | `USER` / `ADMIN` | Reusable `@Elements` library (`Characters`, `Props`, `Backgrounds`) across projects |
| `/app/properties` | `USER` / `ADMIN` | Custom shot property schema manager (`Text`, `Select`, `Multi-select`, `Number`, `Checkbox`, `Person`, `Media`) |
| `/app/ai-history` | `USER` / `ADMIN` | Audit & gallery of user's AI generations (prompt, style, model, credits used, output preview) |
| `/app/workspace/setup` | `USER` / `ADMIN` | Create a new Studio Workspace (name, slug, description, default aspect ratio) |
| `/app/workspace/[workspaceId]` | Member | Studio Workspace projects & elements view |
| `/app/workspace/[workspaceId]/members` | Member | Workspace member roster, role assignment (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`), member addition/removal |
| `/app/profile` | `USER` / `ADMIN` | Current user's creator profile editor and published storyboards |
| `/app/inspiration` | `USER` / `ADMIN` | Community gallery of published storyboards (`isPublic === true`) with like/save/clone |
| `/app/saved` | `USER` / `ADMIN` | User's bookmarked storyboards and saved elements |
| `/app/connections` | `USER` / `ADMIN` | `Followers` and `Following` management and creator discovery |
| `/app/notifications` | `USER` / `ADMIN` | In-app notifications (project comments, shares, new followers) with mark-as-read |
| `/app/settings` | `USER` / `ADMIN` | 5-tab settings page (`Account`, `Profile`, `Notifications`, `Billing`, `Workspace`) |
| `/app/editor/[projectid]` | Owner / Collaborator | Desktop 6-mode Storyboard Editor (`Story Bible`, `Script`, `Storyboard`, `Canvas`, `Table`, `Video`) |
| `/m/editor/[projectid]` | Owner / Collaborator | Mobile-optimized Storyboard & Canvas Editor |

---

## 2. REST API Specification (`src/app/api/*`)

### 2.1 Auth & Admin Account Admission APIs
- `POST /api/auth/[...nextauth]`: NextAuth v4 handler (`CredentialsProvider`).
- `POST /api/invitations/redeem`:
  - Body: `{ token: string, email: string, name: string, password: string }`
  - Validates SHA-256 `tokenHash`, checks `status === "PENDING"` and `expiresAt > now`, verifies email match, hashes password with `bcryptjs` (12 rounds), creates `User`, marks `AccountInvitation` as `ACCEPTED`, logs `INVITATION_REDEEMED` and `USER_REGISTERED`.
- `GET /api/invitations/verify?token=<rawToken>`:
  - Returns `{ valid: boolean, reason?: string, email?: string, role?: string, expiresAt?: string }`.
- `GET /api/admin/invitations`: (`ADMIN` only) Lists invitations with status filtering (`PENDING`, `ACCEPTED`, `REVOKED`, `EXPIRED`).
- `POST /api/admin/invitations`: (`ADMIN` only) Issues a new single-use invitation (`{ email, role, expiresInHours, notes }`) and returns `{ invitation, inviteUrl, rawToken }` once.
- `POST /api/admin/invitations/[id]/revoke`: (`ADMIN` only) Revokes a `PENDING` invitation and writes `INVITATION_REVOKED` to `AuditLog`.
- `POST /api/admin/invitations/[id]/rotate`: (`ADMIN` only) Atomically revokes an old invitation and issues a fresh single-use token, writing `INVITATION_ROTATED` to `AuditLog`.
- `GET /api/admin/audit-logs`: (`ADMIN` only) Returns paginated `AuditLog` entries filterable by `action` and `actorEmail`.

### 2.2 StoryTribe Domain APIs
- `GET /api/projects` & `POST /api/projects`:
  - `GET`: Lists user's owned projects, workspace projects, and shared projects.
  - `POST`: Creates a new project (`blank`, `ai-wizard`, `import-script`, or `template`), initializing default scenes, stages (shots), and video animatic entity.
- `GET /api/projects/[id]`, `PUT /api/projects/[id]`, `DELETE /api/projects/[id]`:
  - Full read, atomic state sync (`title`, `synopsis`, `coverImage`, `coverPalette`, `dimensions`, `annotationFields`, `scenes`, `stages`, `objects`, `elements`, `video`), duplicate (`POST /api/projects/[id]/duplicate`), and delete.
- `POST /api/projects/[id]/share`:
  - Updates `isPublic`, `shareAccess` (`"off" | "view" | "comment"`), generates `shareToken`, or invites guest collaborators by email (`ProjectGuest`).
- `GET /api/projects/[id]/comments` & `POST /api/projects/[id]/comments` & `PATCH /api/projects/[id]/comments/[commentId]`:
  - Lists, creates (with optional `{ stageId, x, y, parentId }`), resolves/reopens, or deletes comments.
- `GET /api/elements` & `POST /api/elements` & `DELETE /api/elements/[id]`:
  - CRUD for reusable `@Elements` (`CHARACTER`, `PROP`, `BACKGROUND`) with SVG/image data and color/rig metadata.
- `GET /api/properties` & `POST /api/properties` & `PUT /api/properties/[id]` & `DELETE /api/properties/[id]`:
  - CRUD for user/workspace custom shot property definitions (`key`, `label`, `type`, `category`, `options`).
- `GET /api/workspaces` & `POST /api/workspaces` & `GET /api/workspaces/[id]` & `POST /api/workspaces/[id]/members`:
  - Studio Workspace creation and team member management.
- `POST /api/ai/generate`:
  - Deterministic, production-safe StoryTribe AI generator for:
    1. `type: "image"`: Synthesizes rich layered SVG/Canvas artwork tailored to prompt, style preset, aspect ratio, `@elements`, and `noBackground`.
    2. `type: "script"`: Generates or expands screenplay scenes, shots, dialogue, and camera annotations from a story prompt.
    3. `type: "synopsis"`: Summarizes project scenes and script blocks into a cohesive Story Bible logline & synopsis.
    4. `type: "voiceover"`: Synthesizes timed voiceover track metadata & Web Audio / WAV waveform for the Video Animatic timeline.
  - Persists every generation in `AiGeneration` (`/app/ai-history`).
- `GET /api/profile`, `PUT /api/profile`, `GET /api/connections`, `POST /api/connections`, `GET /api/saved`, `POST /api/saved`, `GET /api/notifications`, `PATCH /api/notifications`:
  - Full user profile, settings, saved items, social graph (`Followers`/`Following`), and notifications endpoints.

---

## 3. Editor Keyboard Shortcuts & Interaction Contract

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Z` | Undo last project/stage/canvas change (50-step stack) |
| `Ctrl/Cmd + Y` or `Ctrl/Cmd + Shift + Z` | Redo |
| `Ctrl/Cmd + S` | Immediate cloud save to `PUT /api/projects/[id]` |
| `V` | Select tool (`activeMenu = "select"`) |
| `B` | Sketch / Draw brush tool (`activeMenu = "sketch"`) |
| `C` | Comment pin tool (`activeMenu = "comment"`) |
| `T` | Insert Text object on active stage |
| `R` | Insert Rectangle shape on active stage |
| `O` | Insert Circle/Ellipse shape on active stage |
| `Delete` / `Backspace` | Delete selected canvas object(s) |
| `Ctrl/Cmd + D` | Duplicate selected canvas object(s) |
| `Ctrl/Cmd + +` / `Ctrl/Cmd + -` / `Ctrl/Cmd + 0` | Zoom in / Zoom out / Fit stage to screen |
| `Space` (hold) or `H` | Pan canvas viewport |
