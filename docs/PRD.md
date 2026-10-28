# Product Requirements Document (PRD): StoryTribe Production Replica

## 1. Product Vision & Overview

**StoryTribe** is a collaborative visual storytelling, pre-production, and storyboarding platform built for filmmakers, video producers, agencies, marketers, UX designers, and educators. It enables users to write scripts, build storyboards using customizable illustrated characters and AI generation, organize production shot lists, collaborate via frame-accurate comments, and assemble timed video animatics—without requiring advanced drawing skills.

This project delivers a complete, production-ready replica of `https://storytribeapp.com` (v3.4.6) built on **Next.js 16**, **NextAuth v4**, and **Prisma 7** (SQLite for local dev, PostgreSQL for production), enhanced with **enterprise Invite-Only Account Admission, RBAC, Invitation Revocation/Rotation, and Security Audit Logging**.

---

## 2. Target Personas

1. **Film & Video Director / Producer**: Writes scene-by-scene scripts, defines camera angles/shot sizes/movements, builds visual storyboards, and exports 3-per-page PDFs or shot list tables for crew shoots.
2. **Creative Agency / Marketing Team**: Collaborates in shared Studio Workspaces, maintains reusable brand `@Characters`, `@Props`, and `@Backgrounds` in the Story Bible, gathers client feedback via frame-anchored comment pins, and presents interactive share links.
3. **Content Creator / Animator**: Uses the customizable Character Builder, Sketch/Draw brushes, Speech/Thought bubbles, and the multi-track Video Animatic NLE timeline (with voiceover recording/TTS and music tracks) to produce animatics.
4. **Platform Administrator (`ADMIN`)**: Governs access to the instance by issuing single-use expiring invitation codes, assigning `USER` or `ADMIN` roles, revoking or rotating pending invitations, and auditing security events.

---

## 3. Core Product Capabilities & Functional Requirements

### 3.1 Public Marketing & Share Experience
- **Marketing Pages**:
  - `/` (Homepage): Hero section, interactive feature highlights (Character Builder, Script-to-Storyboard, Story Bible, Animatics), social proof, pricing preview, and FAQ.
  - `/features`: Deep dive into all 6 editor modes, character rigging, asset library, and export workflows.
  - `/pricing`: Transparent tier comparison (`Free`, `Creator Pro`, `Studio / Business`) with monthly/annual billing toggle.
  - `/help`: Searchable Help Center, keyboard shortcut reference, and getting-started guides.
- **Public Share Views**:
  - `/share/[token]`: Read-only or comment-enabled storyboard viewer supporting Grid, Presentation slideshow, and Script views based on project share settings.
  - `/v/[shareToken]`: Public Video Animatic player page.
  - `/[username]`: Public creator portfolio displaying published storyboards and follower stats.

### 3.2 Invite-Only Authentication, RBAC & Audit Governance
- **Invite-Only Registration (`/invite/[token]` & `/login-signup`)**:
  - Open registration is disabled. New accounts can only be registered using a valid, unrevoked, unexpired, single-use invitation token.
  - Invitation emails are normalized and strictly matched on redemption.
- **Authentication (`/login-signup`, `/forgotten-password`)**:
  - Email + password login (`bcryptjs` 12 rounds) via NextAuth v4 JWT sessions.
  - Clear, accessible error states (`Incorrect email or password`, expired/revoked invitation alerts).
- **Admin Governance (`/admin/invitations`, `/admin/audit-logs`)**:
  - Issue new invitations (`email`, `role: USER | ADMIN`, `expiresInHours: 1..720`) with one-time copyable invite link.
  - Filter invitations by status (`PENDING`, `ACCEPTED`, `REVOKED`, `EXPIRED`), revoke pending invites, or rotate/regenerate expired or pending tokens.
  - Inspect immutable `AuditLog` entries (`INVITATION_CREATED`, `INVITATION_REDEEMED`, `INVITATION_REVOKED`, `INVITATION_ROTATED`, `USER_REGISTERED`, `USER_LOGIN_SUCCESS`, `USER_LOGIN_FAILED`).

### 3.3 Workspace & Dashboard Shell (`/app/*`)
- **Left Sidebar Navigation**:
  - Primary: `Home` (`/app/dashboard`), `Create` (`/app/create`).
  - Workspace Switcher (`Personal` + custom Studio Workspaces): `Projects` (`/app/projects`), `Shared with me` (`/app/shared`), `Elements` (`/app/elements`), `Properties` (`/app/properties`), `AI History` (`/app/ai-history`), `New workspace` (`/app/workspace/setup`), `Members` (`/app/workspace/[workspaceId]/members`).
  - User & Community: `My Profile` (`/app/profile`), `Inspiration` (`/app/inspiration`), `Saved` (`/app/saved`), `Connections` (`/app/connections`), `Notifications` (`/app/notifications`), `Settings` (`/app/settings`).
  - Admin (visible to `ADMIN` role): `Invitations` (`/admin/invitations`), `Audit Logs` (`/admin/audit-logs`).
- **Project Creation Flows (`/app/create`)**:
  1. **Blank Storyboard**: Choose aspect ratio (`16:9` 1920x1080, `9:16` 1080x1920, `4:3` 1440x1080, `1:1` 1080x1080, `2.35:1` 1920x817, or Custom `200–6000px`).
  2. **AI Script-to-Storyboard Wizard**: Enter a story prompt or concept, select genre/tone and shot count, and automatically generate structured scenes, shots, script blocks, camera properties, and illustrated frames.
  3. **Import Script**: Upload or paste `.txt`, `.fountain`, or screenplay text; automatically parse `INT./EXT.` scene headings, action lines, character cues, and dialogue into scenes and shots.
  4. **Storyboard Templates**: Start from production-tested templates (Commercial Spot, Short Film Scene, UX User Journey, YouTube Explainer) that instantiate real editable projects on demand.

### 3.4 6-Mode Storyboard Editor (`/app/editor/[projectid]` & `/m/editor/[projectid]`)
1. **Story Bible (`bible`)**:
   - Customizable cover banner (solid colors, gradient aura palettes, cover upload).
   - Project title & logline/synopsis with `Summarise with AI` (synthesizes synopsis directly from project scenes and script blocks).
   - Project `@Elements` registry (`Characters`, `Props`, `Backgrounds`) linked to shots.
2. **Script / Writer (`writer`)**:
   - Scene-by-scene screenplay editor (`Scene 1: INT. LOCATION - DAY`) with scene description and ordered shots (`1.1`, `1.2`, `2.1`).
   - Structured script blocks per shot: `Action`, `Character / Speaker`, `Dialogue`, `Parenthetical`, `Transition`.
   - Floating quick actions: `AI Script` (expands or refines scene/shot dialogue), `Import script`, and `@ Elements` autocomplete tagging.
3. **Storyboard Grid (`grid`)**:
   - Adjustable grid density (`Compact` toggle, `2` to `8` columns).
   - Search and filter by shot text, `@Element` tag, or `#Scene`.
   - Scene sections with shot count, `+ Add shot`, and `+ Add scene`.
   - Shot cards with live canvas thumbnail preview, shot number (`1.1`), editable title, script snippet, custom property pills (`Visual Detail`, `Camera Angle`, `Shot Size`, `Movement`, `+ Property`), duplicate/delete actions, and `✨ Generate` button.
4. **Interactive 2D Canvas (`canvas`)**:
   - **Left Tool Rail**:
     - `Select` (`V`): Select, drag, resize, rotate, flip, duplicate, delete canvas objects.
     - `✨ Tribe AI`: Generate custom vector/raster scene or character art from prompt, style preset (`Storyboard Sketch`, `Cinematic Noir`, `Warm Watercolor`, `Clean Vector`, `Comic Ink`), `@Consistent element`, `#Reference shot`, and `No background` toggle.
     - `@ Saved Elements`: Insert or save reusable `@Character`, `@Prop`, or `@Background` elements.
     - `🔍 Search Assets`: Browse and search built-in StoryTribe vector library (`Scenes`, `Characters`, `Props`, `Icons`, `Themes`).
     - `🧑 Character Builder`: Customize character rig (pose, expression, outfit, hair style, skin tone, hair/shirt/pants colors, view angle: Front / 3/4 / Side / Back, horizontal flip) and insert or update on stage.
     - `✏️ Sketch / Draw`: Freehand vector path drawing on the stage with brush mode (`Normal`, `Inertia`, `Dashed`, `Dotted`), stroke width (`1px–32px`), stroke/fill colors, and `Erase` tool.
     - `💬 Comment`: Click anywhere on the canvas to drop a numbered comment pin `{x, y}` and start a discussion thread.
     - `➕ Create`: Add `Text`, `Square`, `Circle`, `Line`, `Arrow` (single/double), `Speech` bubble (oval/rectangle with adjustable tail), `Thought` bubble, `Frames` (rule-of-thirds / aspect guides / camera viewfinder), or `Upload` image (base64/data URL or file upload).
   - **Right Side Panel (`Script`, `Canvas`, `Layers`, `Comments`)**:
     - `Script`: Edit active shot's title, script blocks, and custom properties without leaving Canvas view.
     - `Canvas`: Stage background color picker, grid/snap controls, `+ Add shot`, `+ Add scene`, and vertical shot filmstrip navigator.
     - `Layers`: Searchable z-ordered layer tree with bring-forward/send-backward, lock/unlock, show/hide, duplicate, and delete.
     - `Comments`: Filter by `Open` / `Resolved`, reply to threads, resolve/reopen comments.
   - **Bottom Canvas Controls**: Help/Tour modal (`?`), Keyboard Shortcuts modal (`⌘`), Hand pan tool (`H`), Fit to screen, Zoom out (`-`), Zoom percentage reset (`50%` / `100%`), Zoom in (`+`).
5. **Table / Shot List (`table`)**:
   - Production spreadsheet view grouped by scene with inline editing for `#`, `Frame` thumbnail, `Title`, `Script`, `Visual Detail`, `Camera Angle`, `Shot Size`, `Movement`, and user-defined custom properties (`+` column button).
6. **Video / Animatic NLE (`video`)**:
   - One-click `Create video` initializes an animatic timeline synced with all storyboard shots.
   - Interactive video preview stage with play/pause, rewind, scrub bar, frame overlays, and Web Audio / SpeechSynthesis playback.
   - Multi-track NLE timeline:
     - **AI Video Clip Track (`🎬+`)**: Attach or generate animated clip segments.
     - **Storyboard Frame Sequence Track**: Adjust per-shot duration (`0.5s–30s`) and transitions (`None`, `Fade`, `Cross Dissolve`, `Wipe`).
     - **Voiceover Track (`🎙️+`)**: Record microphone audio, upload audio, or synthesize voiceover from shot dialogue lines.
     - **Music Track (`🎵+`)**: Select built-in procedural royalty-free background music cues (`Cinematic Pulse`, `Upbeat Acoustic`, `Ambient Lo-Fi`, `Suspense Drone`) or upload custom audio.

### 3.5 Collaboration, Sharing & Export
- **Share Modal**: Invite workspace/project collaborators, configure public share link (`Off`, `Can view`, `Can comment`), copy share URL (`/share/[token]`), or publish to community inspiration (`/app/inspiration`).
- **Export Modal**: Real downloadable exports across 6 layouts (`One shot per page`, `Storyboard, 3 per page`, `Grid overview`, `Images only`, `Screenplay`, `Shot list / Table`) and 5 file formats (`PDF`, `PPTX`, `PNG`, `CSV`, `JSON`), plus `WebM` video export from the Video Animatic editor.

---

## 4. Non-Functional Requirements
- **Zero Dummy Data**: Clean database initialization; no hardcoded fake users or mock projects.
- **Security**: Password hashing via `bcryptjs` (cost 12), SHA-256 invitation token hashing, CSRF protection via NextAuth, server-side RBAC and project ownership/guest authorization on all API endpoints.
- **Responsiveness**: Full desktop (`1440x900+`), tablet (`768x1024`), and mobile (`390x844`, including `/m/editor/[projectid]`) layouts.
