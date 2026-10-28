import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { prisma } from "@/lib/prisma";
import {
  createInvitation,
  generateInvitationToken,
  hashInvitationToken,
  redeemInvitation,
  revokeInvitation,
  rotateInvitation,
  verifyInvitationToken,
} from "@/lib/account-admission";
import { parseScriptToStages } from "@/lib/screenplay-parser";
import {
  generatePrintableStoryboardHtml,
  generateShotListCsv,
} from "@/lib/export/exporter";

describe("StoryTribe Invite-Only Admission, Screenplay Parser & Exporter", () => {
  const createdEmails: string[] = [];

  before(async () => {
    await prisma.auditLog.deleteMany({
      where: {
        actorEmail: { endsWith: "@unit-test.storytribe.local" },
      },
    });
  });

  after(async () => {
    await prisma.user.deleteMany({
      where: { email: { in: createdEmails } },
    });
    await prisma.accountInvitation.deleteMany({
      where: { email: { in: createdEmails } },
    });
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { actorEmail: { in: createdEmails } },
          { details: { contains: "unit-test.storytribe.local" } },
        ],
      },
    });
  });

  it("generates 256-bit base64url tokens and stores only SHA-256 hashes", async () => {
    const { rawToken, tokenHash } = generateInvitationToken();
    const digest = hashInvitationToken(rawToken);
    assert.ok(rawToken.length >= 40);
    assert.match(digest, /^[a-f0-9]{64}$/);
    assert.equal(tokenHash, digest);
    assert.notEqual(digest, rawToken);
  });

  it("creates a PENDING invitation, verifies it, redeems it atomically, and blocks reuse", async () => {
    const email = `director-${Date.now()}@unit-test.storytribe.local`;
    createdEmails.push(email);

    const { invitation, rawToken } = await createInvitation({
      email,
      role: "ADMIN",
      expiresInHours: 24,
    });

    assert.equal(invitation.tokenHash, hashInvitationToken(rawToken));
    assert.notEqual(invitation.tokenHash, rawToken);

    const check = await verifyInvitationToken(rawToken);
    assert.equal(check.valid, true);
    assert.equal(check.invitation?.email, email);

    const redeemedUser = await redeemInvitation({
      token: rawToken,
      email,
      name: "Unit Test Director",
      password: "SecurePassword!2026",
    });

    assert.equal(redeemedUser.email, email);
    assert.equal(redeemedUser.role, "ADMIN");

    const props = await prisma.propertyDefinition.findMany({
      where: { ownerId: redeemedUser.id },
    });
    assert.ok(props.length >= 4);

    await assert.rejects(
      async () =>
        redeemInvitation({
          token: rawToken,
          email,
          name: "Replay Attacker",
          password: "SecurePassword!2026",
        }),
      /already been used/i
    );
  });

  it("supports token rotation and invalidates the old token", async () => {
    const email = `artist-${Date.now()}@unit-test.storytribe.local`;
    createdEmails.push(email);

    const { invitation, rawToken: firstToken } = await createInvitation({
      email,
      role: "USER",
    });

    const { rawToken: rotatedToken } = await rotateInvitation({
      id: invitation.id,
    });

    assert.notEqual(rotatedToken, firstToken);

    const oldCheck = await verifyInvitationToken(firstToken);
    assert.equal(oldCheck.valid, false);

    const newCheck = await verifyInvitationToken(rotatedToken);
    assert.equal(newCheck.valid, true);
  });

  it("supports revoking a PENDING invitation and blocks redemption", async () => {
    const email = `revoked-${Date.now()}@unit-test.storytribe.local`;
    createdEmails.push(email);

    const { invitation, rawToken } = await createInvitation({
      email,
      role: "USER",
    });

    await revokeInvitation({ id: invitation.id });

    const check = await verifyInvitationToken(rawToken);
    assert.equal(check.valid, false);
    assert.equal(check.status, "REVOKED");
  });

  it("parses INT./EXT. screenplay text into storyboard stages and exports CSV/HTML", () => {
    const stages = parseScriptToStages(
      "INT. COFFEE SHOP - DAY\nMaya steams milk at the espresso bar.\nEXT. CITY STREET - DAY\nCommuters walk past the cafe window."
    );
    assert.equal(stages.length, 2);
    assert.ok(stages[0].title.includes("INT. COFFEE SHOP - DAY"));

    const mockProject: any = {
      id: "proj_1",
      title: "Coffee Commercial",
      synopsis: "Warm specialty coffee spot",
      width: 1920,
      height: 1080,
      annotationFields: ["visualdetail", "cameraangle", "shotsize", "movement"],
      scenes: [
        {
          id: "sc_1",
          title: "INT. COFFEE SHOP - DAY",
          description: "Opening scene",
          shotIds: stages.map((s) => s.id),
        },
      ],
      stageOrder: stages.map((s) => s.id),
      stages,
      elements: [],
      comments: [],
      videoProject: null,
      shareToken: "abc12345",
      isPublic: false,
      shareAccess: "off",
      isPublishedToCommunity: false,
      likesCount: 0,
      updatedAt: new Date().toISOString(),
    };

    const csv = generateShotListCsv(mockProject);
    assert.ok(csv.includes("Shot #"));
    assert.ok(csv.includes("INT. COFFEE SHOP - DAY"));

    const html = generatePrintableStoryboardHtml(mockProject, {
      layout: "grid_storyboard",
    });
    assert.ok(html.includes("<!DOCTYPE html>"));
    assert.ok(html.includes("Coffee Commercial"));
  });
});
