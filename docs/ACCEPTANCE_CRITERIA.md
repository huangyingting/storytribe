# Acceptance Criteria (`ACCEPTANCE_CRITERIA.md`)

## AC-1: Zero Dummy Data & Clean Database Initialization
- **Given** a freshly migrated database (`npx prisma migrate deploy`),
- **When** querying `User`, `AccountInvitation`, `Project`, `Workspace`, and `Stage`,
- **Then** all tables contain `0` rows (no pre-seeded demo users, no hardcoded mock projects).

## AC-2: Invite-Only Account Admission, Single-Use Tokens, Revocation & Rotation
- **Given** the CLI bootstrap command `npm run bootstrap:admin -- --email admin@example.com`,
- **When** executed,
- **Then** a `PENDING` `AccountInvitation` with `role = "ADMIN"` and a SHA-256 `tokenHash` is stored, an `INVITATION_CREATED` audit log entry is written, and the raw token URL (`/invite/<token>`) is printed once.
- **When** a user attempts to register without a valid invitation token or with a mismatched email,
- **Then** registration is rejected with HTTP `400`, and no `User` record is created.
- **When** the invitee redeems `/invite/<token>` with a valid password (`>= 8` chars),
- **Then** the `User` is created with `role = "ADMIN"`, the invitation status transitions atomically to `ACCEPTED`, and `INVITATION_REDEEMED` + `USER_REGISTERED` entries are recorded in `AuditLog`.
- **When** the same token is submitted a second time,
- **Then** redemption fails with `"Invitation has already been used"`.
- **When** an `ADMIN` revokes or rotates a `PENDING` invitation in `/admin/invitations`,
- **Then** the old token is immediately invalidated (`REVOKED`) and logged in `/admin/audit-logs`.

## AC-3: Authentication & Role-Based Access Control (RBAC)
- **Given** an unauthenticated visitor,
- **When** navigating to `/app/dashboard` or `/admin/invitations`,
- **Then** they are redirected to `/login-signup`.
- **Given** a signed-in user with `role = "USER"`,
- **When** requesting `/admin/invitations` or `/api/admin/invitations`,
- **Then** access is denied (`403 Forbidden` / redirect).
- **When** submitting invalid credentials on `/login-signup`,
- **Then** the UI displays `"Incorrect email or password"` and writes a `USER_LOGIN_FAILED` entry to `AuditLog`.

## AC-4: Workspace Navigation & Project Creation Flows (`/app/*`)
- **Given** an authenticated user on `/app/create`,
- **When** creating a project via:
  1. **Blank Storyboard** (choosing aspect ratio `16:9`, `9:16`, `4:3`, `1:1`, `2.35:1`, or Custom dimensions),
  2. **AI Script-to-Storyboard Wizard**,
  3. **Import Script** (parsing `INT./EXT.` screenplay scenes and dialogue), or
  4. **Storyboard Template**,
- **Then** the project, scenes, and stages are persisted in the database and opened in `/app/editor/[projectid]`.
- **When** visiting `/app/dashboard`, `/app/projects`, `/app/shared`, `/app/elements`, `/app/properties`, `/app/ai-history`, `/app/workspace/setup`, `/app/profile`, `/app/inspiration`, `/app/saved`, `/app/connections`, `/app/notifications`, and `/app/settings`,
- **Then** each route renders its authentic StoryTribe UI backed by real database queries and mutations.

## AC-5: 6-Mode Storyboard Editor (`/app/editor/[projectid]`)
- **Given** an open project in `/app/editor/[projectid]`,
- **Then** the user can switch seamlessly among all 6 modes in the top mode bar:
  1. **Story Bible**: Change cover banner palette, edit project title & synopsis, click `Summarise with AI`, and manage `@Character`, `@Prop`, and `@Background` elements.
  2. **Script**: Add/edit scenes and shots, edit structured script blocks (`Action`, `Character`, `Dialogue`, `Parenthetical`, `Transition`), run `AI Script`, and import screenplay text.
  3. **Storyboard**: View and reorder shots in a multi-column grid (`2..8` columns or `Compact`), filter by `@element` or `#scene`, edit shot properties (`Visual Detail`, `Camera Angle`, `Shot Size`, `Movement`, `+ Property`), and click `✨ Generate`.
  4. **Canvas**:
     - Use all 8 left-rail tools (`Select`, `✨ Tribe AI`, `@ Saved Elements`, `🔍 Search Assets`, `🧑 Character Builder`, `✏️ Sketch / Draw`, `💬 Comment`, `➕ Create` Text/Shapes/Bubbles/Frames/Upload).
     - Customize characters (pose, expression, outfit, hair, skin tone, view angle, colors, flip) on the interactive stage.
     - Draw freehand vector strokes (`Normal`, `Inertia`, `Dashed`, `Dotted`) and erase strokes.
     - Use all 4 right-panel tabs (`Script`, `Canvas`, `Layers`, `Comments`) and bottom zoom/pan/shortcuts controls.
     - Undo (`Ctrl+Z`) and Redo (`Ctrl+Y`) across up to 50 steps, and persist changes to `PUT /api/projects/[id]`.
  5. **Table**: Inline-edit all shots and custom property columns in a scene-grouped spreadsheet view.
  6. **Video**: Initialize an animatic timeline (`Create video`), adjust per-frame durations and transitions (`None`, `Fade`, `Dissolve`, `Wipe`), add voiceover/TTS tracks and background music tracks, play back the timed animatic with audio, and export video.

## AC-6: Sharing, Collaboration & Multi-Layout Export
- **Given** a project in `/app/editor/[projectid]`,
- **When** the owner opens `Share` and enables public link access (`Can view` or `Can comment`),
- **Then** visiting `/share/[token]` renders the shared storyboard (and allows adding comments when `Can comment` is enabled).
- **When** the user opens `Export` (`Download`) and selects any of the 6 layouts (`One shot per page`, `Storyboard, 3 per page`, `Grid overview`, `Images only`, `Screenplay`, `Shot list / Table`) and formats (`PDF`, `PPTX`, `PNG`, `CSV`, `JSON`),
- **Then** a real, non-empty file in the chosen layout and format is generated and downloaded.
