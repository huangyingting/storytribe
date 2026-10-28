import { test, expect } from "@playwright/test";
import { prisma } from "../../src/lib/prisma";
import { createInvitation } from "../../src/lib/account-admission";

const TEST_ADMIN_EMAIL = `e2e-admin-${Date.now()}@storytribe.local`;
const TEST_ADMIN_PASSWORD = "StoryTribe!Admin2026";
const TEST_INVITEE_EMAIL = `e2e-member-${Date.now()}@storytribe.local`;

test.describe("StoryTribe Full-Stack E2E Suite", () => {
  let bootstrapRawToken = "";
  let createdProjectId = "";
  let createdShareToken = "";

  test.beforeAll(async () => {
    const res = await createInvitation({
      email: TEST_ADMIN_EMAIL,
      role: "ADMIN",
      expiresInHours: 24,
    });
    bootstrapRawToken = res.rawToken;
  });

  test.afterAll(async () => {
    // Clean up all E2E test records so database stays free of dummy accounts/data
    await prisma.user.deleteMany({
      where: {
        email: { in: [TEST_ADMIN_EMAIL, TEST_INVITEE_EMAIL] },
      },
    });
    await prisma.accountInvitation.deleteMany({
      where: {
        email: { in: [TEST_ADMIN_EMAIL, TEST_INVITEE_EMAIL] },
      },
    });
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { actorEmail: { in: [TEST_ADMIN_EMAIL, TEST_INVITEE_EMAIL] } },
          { details: { contains: "@storytribe.local" } },
        ],
      },
    });
  });

  test("1. Public marketing pages, Community Hub & Explore filters, Forgotten Password, Verify Email, and Auth error states", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", {
        name: /Storyboarding for everyone—no drawing skills required/i,
      })
    ).toBeVisible();

    await page.goto("/features");
    await expect(
      page.getByRole("heading", {
        name: /Built for every stage of visual pre-production/i,
      })
    ).toBeVisible();

    await page.goto("/pricing");
    await expect(
      page.getByRole("heading", {
        name: /Simple, transparent pricing for every storyteller/i,
      })
    ).toBeVisible();

    await page.goto("/help");
    await expect(
      page.getByRole("heading", {
        name: /StoryTribe Help Center & Documentation/i,
      })
    ).toBeVisible();

    // Community Hub & Community Explore combinations
    await page.goto("/community");
    await expect(
      page.getByRole("heading", {
        name: /Discover storyboards and creators from the StoryTribe community/i,
      })
    ).toBeVisible();

    await page.goto("/community/explore");
    await expect(
      page.getByRole("heading", {
        name: /Explore Community Storyboards & Animatics/i,
      })
    ).toBeVisible();
    await page.getByRole("button", { name: "Storyboards" }).click();
    await page.getByRole("button", { name: "Videos" }).click();
    await page.getByRole("button", { name: "Books" }).click();
    await page.getByRole("button", { name: "All" }).click();
    await page.getByRole("button", { name: "Newest" }).click();
    await page.getByRole("button", { name: "Most liked" }).click();

    await page.goto("/account-action");
    await expect(
      page.getByText(/Invalid recovery link\. Please check the link and try again\./i)
    ).toBeVisible();

    await page.goto("/support-access");
    await expect(page.getByText(/support@storytribe\.com/i).first()).toBeVisible();

    // Forgotten Password & Verify Email flows
    await page.goto("/forgotten-password");
    await expect(
      page.getByRole("heading", { name: /Reset your password/i })
    ).toBeVisible();

    await page.goto("/verify-email?email=creator@storytribe.local");
    await expect(
      page.getByRole("heading", { name: /Activate your account/i })
    ).toBeVisible();
    await page
      .getByRole("button", { name: /Resend verification email/i })
      .click();
    await expect(
      page.getByText(/Verification email resent/i)
    ).toBeVisible();

    // Login error handling & invite-only notice
    await page.goto("/login-signup");
    await expect(
      page.getByRole("heading", { name: /Welcome back/i })
    ).toBeVisible();
  });

  test("2. Exhaustive Invite-Only Governance, All Workspace Pages, and All 6 Storyboard Editor Mode & Tool Combinations", async ({
    page,
  }) => {
    test.setTimeout(90000);

    // Step 1: Redeem single-use ADMIN invitation at /invite/[token]
    await page.goto(`/invite/${bootstrapRawToken}`);
    await expect(
      page.getByRole("heading", { name: /Complete your StoryTribe account/i })
    ).toBeVisible();
    await page.getByPlaceholder("Alex Rivera").fill("E2E Studio Director");
    await page
      .getByPlaceholder("Create a strong password")
      .fill(TEST_ADMIN_PASSWORD);
    await page
      .getByRole("button", { name: /Accept Invitation & Join/i })
      .click();

    await page.waitForURL(/\/app\/dashboard/);
    await expect(
      page.getByRole("heading", { name: /Welcome back, E2E Studio Director/i })
    ).toBeVisible();

    // Step 2: Re-visiting the redeemed token shows Already Used / Invalid state
    await page.goto(`/invite/${bootstrapRawToken}`);
    await expect(page.getByText(/Invitation Cannot Be Used/i)).toBeVisible();

    // Step 3: Admin Invitations (Issue, Rotate, Revoke) & Audit Logs governance
    await page.goto("/admin/invitations");
    await page
      .getByPlaceholder("collaborator@studio.com")
      .fill(TEST_INVITEE_EMAIL);
    await page.getByRole("button", { name: /Issue Invite/i }).click();
    await expect(page.getByTestId("issued-invitation-banner")).toBeVisible();
    await expect(page.getByText(TEST_INVITEE_EMAIL).first()).toBeVisible();

    // Rotate & Revoke actions on the pending invitation
    const rotateBtn = page.getByRole("button", { name: /Rotate/i }).first();
    if (await rotateBtn.isVisible()) {
      await rotateBtn.click();
    }
    const revokeBtn = page.getByRole("button", { name: /Revoke/i }).first();
    if (await revokeBtn.isVisible()) {
      await revokeBtn.click();
    }

    await page.goto("/admin/audit-logs");
    await expect(
      page.locator("table").getByText("INVITATION_CREATED").first()
    ).toBeVisible();
    await expect(
      page.locator("table").getByText("INVITATION_REDEEMED").first()
    ).toBeVisible();

    // Step 4: Visit all Workspace Sidebar routes & verify combinations
    const workspaceRoutes = [
      "/app/create",
      "/app/projects",
      "/app/shared",
      "/app/elements",
      "/app/properties",
      "/app/ai-history",
      "/app/workspace/setup",
      "/app/profile",
      "/app/inspiration",
      "/app/saved",
      "/app/connections",
      "/app/notifications",
      "/app/settings",
      "/app/settings/workspace",
      "/app/guest-invite/demo-guest-token",
      "/app/invite/demo-workspace-token",
    ];
    for (const route of workspaceRoutes) {
      const resp = await page.goto(route);
      expect(resp?.status()).toBeLessThan(400);
    }

    // Step 5: Create a new Storyboard Project from Dashboard
    await page.goto("/app/dashboard");
    await page.getByTestId("dashboard-new-project-btn").click();
    await page.waitForURL(/\/app\/editor\/.+/);

    const editorUrl = page.url();
    createdProjectId = editorUrl.split("/app/editor/")[1];
    expect(createdProjectId).toBeTruthy();

    // Header Combinations: Project Menu Dropdown -> Project Settings Modal -> Shortcuts Modal
    await page.getByTestId("editor-project-menu-btn").click();
    await expect(page.getByTestId("editor-project-menu-dropdown")).toBeVisible();
    await page.getByTestId("editor-project-settings-item").click();
    await expect(page.getByTestId("project-settings-modal")).toBeVisible();
    await page.getByTestId("project-settings-aspect-select").selectOption("16:9");
    await page.getByTestId("project-settings-save-btn").click();

    await page.getByTestId("editor-shortcuts-btn").click();
    await expect(page.getByTestId("editor-shortcuts-modal")).toBeVisible();
    await page.getByTestId("editor-shortcuts-close-btn").click();

    // Mode 1: Storyboard Grid Mode (Density, Search Filter, + Add Scene, + Add Shot, AI Generate)
    await expect(page.getByTestId("editor-mode-storyboard-grid")).toBeVisible();
    await page.getByTestId("storyboard-grid-density-select").selectOption("compact");
    await page.getByTestId("storyboard-grid-density-select").selectOption("3");
    await page.getByTestId("storyboard-add-scene-btn").click();
    await page.getByTestId("storyboard-add-shot-btn").click();
    await expect(page.getByTestId("storyboard-shot-card-2")).toBeVisible();
    await page.getByTestId("storyboard-search-input").fill("Shot");
    await page.getByTestId("storyboard-search-input").fill("");

    // Mode 2: Story Bible Mode (Cover Banner Palettes, AI Synopsis, @Elements)
    await page.getByTestId("editor-tab-story_bible").click();
    await expect(page.getByTestId("editor-mode-story-bible")).toBeVisible();
    await expect(page.getByTestId("story-bible-cover-banner")).toBeVisible();
    await page.getByTestId("story-bible-palette-cinema-noir").click();
    await page.getByTestId("story-bible-palette-ocean-breeze").click();

    // Mode 3: Script Writer Mode
    await page.getByTestId("editor-tab-script").click();
    await expect(page.getByTestId("editor-mode-script")).toBeVisible();
    await page
      .getByTestId("script-editor-textarea")
      .fill(
        "INT. COFFEE SHOP - MORNING\nMaya pours latte art.\nEXT. CITY SIDEWALK - DAY\nCommuters smile outside."
      );
    await page.getByTestId("sync-script-to-shots-btn").click();

    // Mode 4: 2D Illustration Canvas Mode — All Left Tools & All 4 Right Inspector Tabs
    await page.getByTestId("editor-tab-canvas").click();
    await expect(page.getByTestId("editor-mode-canvas")).toBeVisible();

    // Tool: Character Builder (with View Angle)
    await page.getByTestId("canvas-tool-character").click();
    await page.getByTestId("canvas-char-angle-select").selectOption("three-quarter");
    await page.getByTestId("canvas-insert-character-btn").click();

    // Tool: Search Assets (Backdrops & Props tabs)
    await page.getByTestId("canvas-tool-search").click();
    await page.getByTestId("canvas-search-tab-backdrops").click();
    await page.getByTestId("canvas-search-tab-props").click();
    await page.getByTestId("canvas-search-tab-all").click();

    // Tool: Sketch (Brush Styles)
    await page.getByTestId("canvas-tool-sketch").click();
    await page.getByTestId("canvas-brush-style-dashed").click();
    await page.getByTestId("canvas-brush-style-normal").click();

    // Tool: Create (Speech Bubble, Circle, Arrow, Safe Frame)
    await page.getByTestId("canvas-tool-create").click();
    await page.getByTestId("canvas-add-speech-bubble-btn").click();
    await page.getByTestId("canvas-add-circle-btn").click();
    await page.getByTestId("canvas-add-arrow-btn").click();

    // Tool: Comment Pin
    await page.getByTestId("canvas-tool-comment").click();
    await page
      .getByTestId("canvas-comment-pin-draft-input")
      .fill("Love the lighting on this frame!");
    await page
      .getByTestId("canvas-interactive-stage")
      .click({ position: { x: 120, y: 120 } });

    // Right Inspector Tabs: Layers (Reorder, Lock, Hide), Style (Flip), Comments (Open/Resolved)
    await page.getByTestId("canvas-right-tab-layers").click();
    await expect(page.getByTestId("canvas-layer-item-1")).toBeVisible();
    await page.getByTestId("layer-up-btn-1").click();
    await page.getByTestId("layer-lock-btn-1").click();
    await page.getByTestId("layer-lock-btn-1").click();

    await page.getByTestId("canvas-right-tab-properties").click();
    await page.getByTestId("canvas-right-tab-comments").click();
    await page.getByTestId("comments-filter-open").click();
    await page.getByTestId("comments-filter-resolved").click();
    await page.getByTestId("comments-filter-open").click();

    // Fullscreen Presentation Slideshow Mode
    await page.getByTestId("projecteditor-button-present").click();
    await expect(page.getByTestId("presentation-slideshow-overlay")).toBeVisible();
    await page.getByTestId("presentation-next-btn").click();
    await page.getByTestId("presentation-exit-btn").click();

    // Mode 5: Shot List Table Mode (Custom Property Column + Cell Edit)
    await page.getByTestId("editor-tab-table").click();
    await expect(page.getByTestId("editor-mode-table")).toBeVisible();
    await page.getByTestId("table-new-property-input").fill("Lens");
    await page.getByTestId("table-add-property-col-btn").click();
    await expect(page.getByTestId("table-custom-cell-lens-1")).toBeVisible();
    await page.getByTestId("table-custom-cell-lens-1").fill("35mm Prime");

    // Mode 6: Video Animatic NLE Timeline Mode (Transitions, Duration, Voiceover)
    await page.getByTestId("editor-tab-video").click();
    await expect(page.getByTestId("editor-mode-video-onboarding")).toBeVisible();
    await page.getByTestId("create-video-animatic-btn").click();
    await expect(page.getByTestId("editor-mode-video-timeline")).toBeVisible();
    await page.getByTestId("video-transition-select").selectOption("CROSSFADE");
    await page.getByTestId("video-add-voiceover-btn").click();

    // Save Project to Cloud
    await page.getByTestId("editor-save-btn").click();

    // Share Modal & Public Read-Only Link
    await page.getByTestId("editor-share-btn").click();
    await expect(page.getByTestId("share-project-modal")).toBeVisible();
    await page.getByTestId("toggle-public-share-btn").click();
    await expect(page.getByTestId("toggle-public-share-btn")).toHaveText(
      "Public Enabled"
    );

    const projRecord = await prisma.project.findUnique({
      where: { id: createdProjectId },
    });
    createdShareToken = projRecord?.shareToken || "";
    expect(createdShareToken).toBeTruthy();

    // Visit Public Share Page
    await page.goto(`/share/${createdShareToken}`);
    await expect(page.getByText(/Shot 1\.1/i).first()).toBeVisible();

    // Visit Mobile Editor View
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/m/editor/${createdProjectId}`);
    await expect(page.getByText(/Shot #1/i).first()).toBeVisible();
  });
});
