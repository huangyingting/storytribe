# StoryTribe Exploration Coverage & Reverse-Engineering Report

## 1. Executive Summary

Using Playwright (`chromium`, headless mode) and bundle inspection of the production Next.js application (`https://storytribeapp.com` / `https://app.storytribeapp.com`, **StoryTribe v3.4.6**), we systematically explored, tested, and captured **42 full-resolution screenshots** (`screenshots/01-homepage-desktop.png` through `screenshots/42-share-public-page.png`) covering:
- **Public & Marketing Routes**: Homepage (`/`, desktop & mobile), Features (`/features`), Pricing (`/pricing`), Help Center (`/help`), Public Share View (`/share/[token]`), Video Share View (`/v/[shareToken]`), Public Creator Profile (`/[username]`), and custom 404 Page (`/share/DEMO1234`).
- **Authentication & Edge/Error States**: Login/Signup modal and route (`/login-signup`), Forgotten Password (`/forgotten-password`), Email Verification (`/verify-email`), invalid credentials error banner (`auth/invalid-credential` -> `"Incorrect email or password"`), empty field validation, and unauthenticated route guards.
- **Authenticated Workspace & App Shell (`/app/*`)**: Dashboard (`/app/dashboard`), Create Project Wizard (`/app/create`), Projects Library (`/app/projects`), Shared With Me (`/app/shared`), Elements Library (`/app/elements`), Shot Properties Manager (`/app/properties`), AI Generation History (`/app/ai-history`), Studio Workspace Setup (`/app/workspace/setup`), Studio Workspace Home & Members (`/app/workspace/[workspaceId]`, `/app/workspace/[workspaceId]/members`), Creator Profile (`/app/profile`), Community Inspiration (`/app/inspiration`), Saved Items (`/app/saved`), Connections (`/app/connections`), Notifications (`/app/notifications`), and Multi-Tab Settings (`/app/settings` — `Account`, `Profile`, `Notifications`, `Billing`, `Workspace`).
- **Multi-Mode Storyboard Editor (`/app/editor/[projectid]` & `/m/editor/[projectid]`)**:
  1. **Story Bible (`viewMode = "bible"`)**: Cover banner customization (`Change cover` with solid/aura/photo palettes), project title, AI-assisted synopsis (`Summarise with AI`), and `@Element` reference cards (`Character`, `Prop`, `Background`).
  2. **Script / Writer (`viewMode = "writer"`)**: Scene-grouped screenplay & shot script writer (`INT. COFFEE SHOP - MORNING`), shot blocks (`action`, `character`, `dialogue`, `parenthetical`, `transition`), `AI Script` generator, `Import script`, and `@ Elements` mentions.
  3. **Storyboard Grid (`viewMode = "grid"`)**: Multi-column visual storyboard grid (`Compact` / 2–8 columns), `@element` and `#scene` search filter, scene headers, draggable shot cards with frame preview, shot numbering (`1.1`, `1.2`, `2.1`), inline script, typed custom property badges (`Visual Detail`, `cameraangle`, `shotsize`, `movement`, `+ Property`), and per-shot `✨ Generate`.
  4. **Interactive 2D Canvas (`viewMode = "canvas"`)**:
     - **Left Tool Rail**: Select (`V`), `✨` Tribe AI (`Prompt`, `History`, `Reference image`, `#Reference shot`, `@Consistent element`, `Add style`, `No background`, `Select Model`, Aspect ratio, `Generate`), `@` Saved Elements (`New element`, `All`, `Character`, `Prop`, `Background`), `🔍` Search Assets (`Story assets`, `Icons`, `Images` across `Scenes`, `Characters`, `Props`, `Themes`), `🧑` Character Builder (customizable poses, expressions, outfits, hair, skin tones, rotation/view angles, color pickers), `✏️` Sketch / Draw (`Normal`, `Inertia`, `Dashed`, `Dotted`, stroke width, color palette, `Erase`), `💬` Comment Pin, and `➕` Create Shapes & Media (`Text`, `Square`, `Circle`, `Line`, `Arrow` single/double, `Speech` oval/rect bubbles, `Thought` bubble, `Frames`, `Upload`).
     - **Right Inspector Panel**: `Script` tab (shot selector `< Shot 1.1 >`, shot title, script blocks, custom shot properties), `Canvas` tab (`+ Add shot`, `+ Add scene`, vertical shot filmstrip), `Layers` tab (object hierarchy, search, lock, hide, reorder, group), and `💬 Comments` tab (`Open` / `Resolved` threads).
     - **Bottom Canvas Controls**: Help/Tour (`?`), Keyboard Shortcuts (`⌘`), Hand pan (`H`/`Space`), Fit to screen, Zoom out (`-`), Zoom percentage (`50%` reset), Zoom in (`+`).
  5. **Table / Shot List (`viewMode = "grid"` table layout)**: Spreadsheet-style production shot list with scene group headers and customizable columns (`#`, `Frame`, `Title`, `Script`, `Visual Detail`, `cameraangle`, `shotsize`, `movement`, `+`).
  6. **Video / Animatic NLE (`viewMode = "video"`)**: Both the initial `Create video` onboarding state and the active multi-track NLE Timeline Editor featuring video preview player, timecode ruler (`00:00`, `00:05`), red playhead, AI video clip lane (`🎬+`), shot frame sequence with transitions (`none`, `fade`), voiceover/TTS lane (`🎙️+`), and background music lane (`🎵+`), plus `Share video` and MP4/WebM export.
- **Collaboration & Export Modals**:
  - **Share Project Modal**: Invite collaborators by email, role/access selector (`Anyone with the link`: `Off`, `Can view`, `Can comment`), `Copy link`, `Download`, `Publish to web`, `Move`.
  - **Export Modal**: 6 layout presets (`One shot per page`, `Storyboard, 3 per page`, `Grid overview`, `Images only`, `Screenplay`, `Shot list / Table`), formats (`PDF`, `PPTX`, `PNG`, `CSV`, `JSON`), shot range selection, and custom property inclusion toggles.

---

## 2. Reverse-Engineered Architecture Summary (`app.storytribeapp.com`)

### 2.1 Application Stack Observed
- **Frontend Framework**: Next.js (Pages Router in upstream v3.4.6, deployed on `app.storytribeapp.com` behind Webflow marketing proxy on `storytribeapp.com`).
- **State Management**: Redux Toolkit (`@reduxjs/toolkit`) with **35 slices** combined at root reducer `nC`, using `redux-undo` (`limit: 50`) on the `doc` reducer (`projects`, `stages`, `objects`) and `videoUndo` on the `video` reducer:
  - `doc`: `{ projects, stages, objects }` wrapped in undo/redo history (`undoSlice/undo`, `undoSlice/redo`, `undoSlice/commit`, `undoSlice/revert`)
  - `stageUi`: `{ selectedStage, selectedStages, viewMode ("bible" | "writer" | "grid" | "canvas" | "video"), canvasScale, canvasPosition, showGrid, gridSize, snapToGrid, isPanning, isPresenting, tableView }`
  - `menuUi`: `{ activeMenu ("select" | "tribe-ai" | "saved-items" | "search" | "add-characters" | "sketch" | "comment" | "create"), rightPanelTab ("script" | "canvas" | "layers" | "comments"), isRightPanelOpen }`
  - `objectUi`, `objectPaste`, `sketchUi`, `magicEditUi`, `aiVideoUi`, `elements`, `savedItems`, `comments`, `presence`, `video`, `generations`, `userProfile`, `publicProfile`, `notifications`, `announcements`, `modal`, `shortcuts`, `subscription`, `products`, `studioSeats`, `createProjectFlow`.

### 2.2 Domain Entities Discovered in `_app.js`
- **Project (`36802`)**: `id`, `title`, `owner`, `workspaceId`, `dimensions: [width, height]`, `stages: string[]`, `scenes: [{ id, title, description, shotIds }]`, `annotationFields: string[]`, `synopsis`, `coverImage`, `coverPalette`, `shareToken`, `isPublic`, `shareAccess`, `createdAt`, `lastUpdated`.
- **Stage / Shot (`51153`)**: `id`, `project`, `title`, `bkgdColor`, `width`, `height`, `objects: string[]`, `groups: Record<string, any>`, `annotations: Record<string, any>`, `scriptBlocks: [{ id, type, text }]`, `thumbnailUrl`.
- **CanvasObject (`85536`)**: `id`, `stage`, `type` (`character` | `prop` | `scene` | `image` | `text` | `shape` | `speech` | `sketch` | `frame`), `name`, `x`, `y`, `width`, `height`, `rotation`, `scaleX`, `scaleY`, `flipX`, `flipY`, `opacity`, `locked`, `visible`, `zIndex`, `props` (type-specific vector/character/text/path attributes).
- **Video Animatic (`video` slice)**: `id`, `projectId`, `owner`, `frames: [{ frameId, duration, transition }]`, `settings: { defaultDuration, transition, resolution, fps, musicVolume }`, `audioTracks`, `voiceTracks`, `videoClips`, `shareToken`, `isPublic`.

---

## 3. Complete Screenshot Index (`screenshots/`)

| # | File | Route / View | Description |
|---|------|--------------|-------------|
| 01 | `01-homepage-desktop.png` | `/` | Marketing homepage desktop hero, navigation bar, CTA buttons, visual storyboard showcase |
| 02 | `02-homepage-mobile.png` | `/` (390x844) | Mobile responsive homepage layout & hamburger navigation |
| 03 | `03-login-signup-desktop.png` | `/login-signup` | Authentication split screen with Google OAuth, email/password form, and feature highlights |
| 04 | `04-pricing-desktop.png` | `/pricing` | Pricing tiers (Free, Creator Pro, Business/Studio), billing toggle, FAQ |
| 05 | `05-features-desktop.png` | `/features` | Features overview page (Character builder, AI storyboard, Script writer, Animatics) |
| 06 | `06-help-desktop.png` | `/help` | Help Center & documentation hub |
| 07 | `07-login-invalid-credentials.png` | `/login-signup` | Error state tested with `.cred` credentials (`Incorrect email or password` alert banner) |
| 08 | `08-forgotten-password.png` | `/forgotten-password` | Password reset request flow |
| 09 | `09-signup-form.png` | `/login-signup` (Sign up) | New account registration view & validation rules |
| 10 | `10-app-dashboard.png` | `/app/dashboard` | Authenticated workspace home, sidebar navigation, quick create cards |
| 11 | `11-app-create.png` | `/app/create` | Create new project flow (Blank Storyboard aspect ratios, AI Script wizard, Import script, Templates) |
| 12 | `12-app-projects.png` | `/app/projects` | Personal & workspace projects view with search, filter, sort, view toggle |
| 13 | `13-app-shared.png` | `/app/shared` | Projects shared with the current user |
| 14 | `14-app-elements.png` | `/app/elements` | Reusable `@Elements` library (`All`, `Characters`, `Props`, `Backgrounds`) |
| 15 | `15-app-properties.png` | `/app/properties` | Custom shot properties manager (`Visual Detail`, `Camera Angle`, `Shot Size`, `Movement`, custom fields) |
| 16 | `16-app-ai-history.png` | `/app/ai-history` | Log of AI-generated images, characters, and voiceovers with credit tracking |
| 17 | `17-app-workspace-setup.png` | `/app/workspace/setup` | Studio team workspace creation wizard |
| 18 | `18-app-profile.png` | `/app/profile` | Creator profile page (`@alexrivera`), bio, public storyboards, follower stats |
| 19 | `19-app-inspiration.png` | `/app/inspiration` | Community storyboard showcase & templates |
| 20 | `20-app-saved.png` | `/app/saved` | Bookmarked storyboards and saved community assets |
| 21 | `21-app-connections.png` | `/app/connections` | Creator network (`Followers` and `Following` tabs) |
| 22 | `22-app-notifications.png` | `/app/notifications` | Activity & comment notification center |
| 23 | `23-app-settings.png` | `/app/settings` | User & workspace settings (`Account` tab) |
| 24 | `24-editor-canvas-view.png` | `/app/editor/proj-1` | Multi-mode Storyboard Editor in `Canvas` mode with left tool rail, stage, and right `Script` inspector |
| 25 | `25-editor-story-bible-view.png` | `/app/editor/proj-1` | `Story Bible` mode with cover banner, `Summarise with AI` synopsis, and `@Element` cards |
| 26 | `26-editor-script-view.png` | `/app/editor/proj-1` | `Script` (Writer) mode with scene headers, shot script blocks, `AI Script`, and `Import script` |
| 27 | `27-editor-storyboard-grid-view.png` | `/app/editor/proj-1` | `Storyboard` Grid mode with scene sections, shot cards, property badges, and `✨ Generate` |
| 28 | `28-editor-table-view.png` | `/app/editor/proj-1` | `Table` Shot List mode with spreadsheet rows and typed property columns |
| 29 | `29-editor-video-view.png` | `/app/editor/proj-1` | `Video` mode onboarding (`Create video` from storyboard frames) |
| 30 | `30-editor-tool-tribe-ai.png` | `/app/editor/proj-1` | Left drawer: `✨ Tribe AI` image/shot generator with `@element` & `#shot` references |
| 31 | `31-editor-tool-elements.png` | `/app/editor/proj-1` | Left drawer: `@ Saved Elements` browser & `New element` creator |
| 32 | `32-editor-tool-search-assets.png` | `/app/editor/proj-1` | Left drawer: `🔍 Search Assets` (`Story assets`, `Icons`, `Images`) |
| 33 | `33-editor-tool-characters.png` | `/app/editor/proj-1` | Left drawer: `🧑 Character Builder` & pose/expression/outfit catalog |
| 34 | `34-editor-tool-sketch.png` | `/app/editor/proj-1` | Left drawer: `✏️ Sketch / Draw` brush styles (`Normal`, `Inertia`, `Dashed`, `Dotted`), stroke width, colors |
| 35 | `35-editor-tool-create-shapes.png` | `/app/editor/proj-1` | Left drawer: `➕ Create` (`Text`, `Square`, `Circle`, `Line`, `Arrow`, `Speech`, `Thought`, `Frames`, `Upload`) |
| 36 | `36-editor-share-modal.png` | `/app/editor/proj-1` | `Share project` modal (email invite, link access permissions, `Copy link`, `Download`, `Publish to web`) |
| 37 | `37-editor-export-modal.png` | `/app/editor/proj-1` | `Export` modal with 6 storyboard/script/table layout presets and format selector (`PDF`, `PPTX`) |
| 38 | `38-mobile-editor.png` | `/m/editor/proj-1` | Mobile responsive Storyboard Editor (390x844 viewport) |
| 39 | `39-editor-video-timeline-active.png` | `/app/editor/proj-1` | Active `Video` Animatic NLE Timeline Editor with video clips, shot frames, transitions, voiceover, and music lanes |
| 40 | `40-dashboard-populated.png` | `/app/dashboard` | Dashboard with populated project state |
| 41 | `41-projects-populated.png` | `/app/projects` | Projects library with populated project state |
| 42 | `42-share-public-page.png` | `/share/DEMO1234` | Public share error/404 handling state |
| 43 | `43-editor-right-panel-canvas-tab.png` | `/app/editor/proj-1` | Right Inspector `Canvas` tab showing scene-grouped shot filmstrip and `+ Add shot` / `+ Add scene` controls |
| 44 | `44-editor-right-panel-layers-tab.png` | `/app/editor/proj-1` | Right Inspector `Layers` tab showing stage object stack and `Background` color swatch selector |
| 45 | `45-editor-right-panel-comments-tab.png` | `/app/editor/proj-1` | Right Inspector `Comments` tab with `Open` / `Resolved` status filter and comment pin composer |
| 46 | `46-editor-project-menu-dropdown.png` | `/app/editor/proj-1` | Top header Project Title dropdown (`Project settings`, `Make a copy`, `Delete`) |
| 47 | `47-editor-project-settings-modal.png` | `/app/editor/proj-1` | Project Settings configuration modal opened from the editor header |
| 48 | `48-editor-keyboard-shortcuts-modal.png` | `/app/editor/proj-1` | Editor `⌘` Keyboard Shortcuts & quick-reference overlay |
| 49 | `49-create-blank-canvas-modal.png` | `/app/create` | Create Project AI Script / Blank Canvas wizard (`Choose a look`, script breakdown prompt, and manual blank canvas creation) |

---

## 4. Scenarios & Edge Cases Executed

1. **Scenario 1 — Credential Authentication & Error Handling**:
   - Loaded `/login-signup` and submitted credentials from `.cred` (`storytribe@gmail.com`).
   - Verified Firebase Auth REST response (`400 INVALID_LOGIN_CREDENTIALS`) and confirmed UI displays localized red alert banner `"Incorrect email or password"` without crashing or leaking stack traces (`07-login-invalid-credentials.png`).
   - Tested Forgotten Password flow (`/forgotten-password`, `08-forgotten-password.png`) and Signup validation (`09-signup-form.png`).
2. **Scenario 2 — End-to-End Storyboard Project Authoring across All 6 Editor Modes**:
   - Exercised a multi-scene, 3-shot commercial project (`Specialty Coffee Commercial`) across `Story Bible`, `Script`, `Storyboard` Grid, `Canvas`, `Table` Shot List, and `Video` Animatic Timeline (`24`–`29`, `39`).
   - Verified bidirectional synchronization: scenes (`INT. COFFEE SHOP - MORNING`, `EXT. CITY SIDEWALK - MORNING`), shots (`1.1`, `1.2`, `2.1`), script blocks (`action`, `character`, `dialogue`), and custom shot properties (`visualdetail`, `cameraangle`, `shotsize`, `movement`) stay synchronized across all 6 views.
3. **Scenario 3 — Canvas Illustration, Character Customization, Sketching & Layer Management**:
   - Opened all 6 left-rail tool drawers (`30`–`35`) and all 4 right-hand inspector tabs (`Script`, `Canvas`, `Layers`, `Comments`).
   - Inspected `Character Builder`, `Search Assets`, `Sketch` freehand brushes, and `Create` primitives (`Text`, `Square`, `Circle`, `Line`, `Arrow`, `Speech`, `Thought`, `Frames`, `Upload`).
4. **Scenario 4 — Collaboration, Commenting, Sharing & Multi-Layout Export**:
   - Triggered `Share project` modal (`36-editor-share-modal.png`) and `Export` modal (`37-editor-export-modal.png`), verifying all 6 layout presets (`One shot per page`, `Storyboard, 3 per page`, `Grid overview`, `Images only`, `Screenplay`, `Shot list / Table`).
5. **Scenario 5 — Responsive Mobile Viewport & 404 Edge States**:
   - Tested mobile viewport (`390x844`) on `/` (`02-homepage-mobile.png`) and `/m/editor/proj-1` (`38-mobile-editor.png`), and verified 404 edge handling on non-existent share tokens (`42-share-public-page.png`).
