import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import {
  generateInvitationToken,
  hashInvitationToken,
  isValidEmail,
  normalizeEmail,
} from "./token";
import { writeAuditLog } from "./audit";

export class InvitationError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "InvitationError";
    this.status = status;
    this.code = code;
  }
}

export interface CreateInvitationParams {
  email: string;
  role?: "USER" | "ADMIN";
  expiresInHours?: number;
  notes?: string;
  invitedById?: string | null;
  invitedByEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function expireStaleInvitations(now = new Date()) {
  await prisma.accountInvitation.updateMany({
    where: {
      status: "PENDING",
      expiresAt: { lte: now },
    },
    data: {
      status: "EXPIRED",
    },
  });
}

export async function createInvitation(params: CreateInvitationParams) {
  if (!isValidEmail(params.email)) {
    throw new InvitationError(400, "INVALID_EMAIL", "Please provide a valid email address.");
  }

  const normalizedEmail = normalizeEmail(params.email);
  const role = params.role === "ADMIN" ? "ADMIN" : "USER";
  const expiresInHours = Math.min(Math.max(params.expiresInHours ?? 72, 1), 720);
  const now = new Date();
  const expiresAt = new Date(now.getTime() + expiresInHours * 3600 * 1000);

  await expireStaleInvitations(now);

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  });
  if (existingUser) {
    throw new InvitationError(
      409,
      "USER_ALREADY_EXISTS",
      "An account with this email address is already registered."
    );
  }

  const existingPending = await prisma.accountInvitation.findFirst({
    where: {
      normalizedEmail,
      status: "PENDING",
      expiresAt: { gt: now },
    },
  });
  if (existingPending) {
    throw new InvitationError(
      409,
      "PENDING_INVITATION_EXISTS",
      "An active pending invitation already exists for this email. Revoke or rotate it first."
    );
  }

  const { rawToken, tokenHash } = generateInvitationToken();

  const invitation = await prisma.accountInvitation.create({
    data: {
      email: params.email.trim(),
      normalizedEmail,
      tokenHash,
      role,
      status: "PENDING",
      expiresAt,
      notes: params.notes?.trim() || null,
      invitedById: params.invitedById || null,
    },
  });

  await writeAuditLog({
    action: "INVITATION_CREATED",
    actorId: params.invitedById || null,
    actorEmail: params.invitedByEmail || "system-cli",
    targetType: "AccountInvitation",
    targetId: invitation.id,
    details: {
      invitedEmail: normalizedEmail,
      role,
      expiresAt: expiresAt.toISOString(),
      notes: invitation.notes,
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    invitation,
    rawToken,
  };
}

export async function verifyInvitationToken(rawToken: string, now = new Date()) {
  if (!rawToken || !rawToken.trim()) {
    return { valid: false as const, reason: "Missing invitation code." };
  }

  const tokenHash = hashInvitationToken(rawToken);
  const invitation = await prisma.accountInvitation.findUnique({
    where: { tokenHash },
  });

  if (!invitation) {
    return { valid: false as const, reason: "Invalid invitation code." };
  }

  if (invitation.status === "REVOKED") {
    return {
      valid: false as const,
      reason: "This invitation has been revoked by an administrator.",
      status: "REVOKED" as const,
      email: invitation.email,
    };
  }

  if (invitation.status === "ACCEPTED") {
    return {
      valid: false as const,
      reason: "Invitation has already been used.",
      status: "ACCEPTED" as const,
      email: invitation.email,
    };
  }

  if (invitation.status === "EXPIRED" || invitation.expiresAt <= now) {
    if (invitation.status === "PENDING") {
      await prisma.accountInvitation.update({
        where: { id: invitation.id },
        data: { status: "EXPIRED" },
      });
    }
    return {
      valid: false as const,
      reason: "This invitation has expired.",
      status: "EXPIRED" as const,
      email: invitation.email,
    };
  }

  return {
    valid: true as const,
    invitation: {
      id: invitation.id,
      email: invitation.email,
      normalizedEmail: invitation.normalizedEmail,
      role: invitation.role,
      status: invitation.status,
      expiresAt: invitation.expiresAt,
      notes: invitation.notes,
    },
  };
}

export interface RedeemInvitationParams {
  token: string;
  email: string;
  name: string;
  password: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

function generateUsernameFromEmail(email: string, suffix: string): string {
  const base = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9_]/g, "")
    .toLowerCase()
    .slice(0, 18) || "creator";
  return `${base}_${suffix.slice(-5).toLowerCase()}`;
}

export async function redeemInvitation(params: RedeemInvitationParams) {
  const now = new Date();
  const verification = await verifyInvitationToken(params.token, now);

  if (!verification.valid) {
    throw new InvitationError(400, "INVALID_INVITATION", verification.reason);
  }

  const normalizedInputEmail = normalizeEmail(params.email || verification.invitation.email);
  if (normalizedInputEmail !== verification.invitation.normalizedEmail) {
    throw new InvitationError(
      400,
      "EMAIL_MISMATCH",
      "Email does not match the address this invitation was issued for."
    );
  }

  if (!params.password || params.password.length < 8) {
    throw new InvitationError(
      400,
      "WEAK_PASSWORD",
      "Password must be at least 8 characters long."
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedInputEmail },
  });
  if (existingUser) {
    throw new InvitationError(
      409,
      "USER_ALREADY_EXISTS",
      "An account with this email already exists."
    );
  }

  const passwordHash = await bcrypt.hash(params.password, 12);
  const tokenHash = hashInvitationToken(params.token);
  const displayName =
    params.name?.trim() || normalizedInputEmail.split("@")[0] || "StoryTribe Creator";

  const user = await prisma.$transaction(async (tx) => {
    const claimed = await tx.accountInvitation.updateMany({
      where: {
        id: verification.invitation.id,
        tokenHash,
        status: "PENDING",
        expiresAt: { gt: now },
      },
      data: {
        status: "ACCEPTED",
        acceptedAt: now,
      },
    });

    if (claimed.count !== 1) {
      throw new InvitationError(
        400,
        "ALREADY_USED",
        "Invitation has already been used or is no longer active."
      );
    }

    const createdUser = await tx.user.create({
      data: {
        email: normalizedInputEmail,
        name: displayName,
        username: generateUsernameFromEmail(normalizedInputEmail, verification.invitation.id),
        passwordHash,
        role: verification.invitation.role,
        emailVerified: now,
        hasCompletedOnboarding: true,
        aiCredits: 100,
        plan: "CREATOR_PRO",
      },
    });

    await tx.accountInvitation.update({
      where: { id: verification.invitation.id },
      data: { acceptedByUserId: createdUser.id },
    });

    // Provision default custom shot properties for the new user
    const defaultProps = [
      {
        key: "visualdetail",
        label: "Visual Detail",
        type: "text",
        category: "Story & Script",
        optionsJson: "[]",
      },
      {
        key: "cameraangle",
        label: "Camera Angle",
        type: "select",
        category: "Camera & Lens",
        optionsJson: JSON.stringify(["Eye Level", "High Angle", "Low Angle", "Dutch Angle", "Overhead / Bird's Eye", "Over the Shoulder"]),
      },
      {
        key: "shotsize",
        label: "Shot Size",
        type: "select",
        category: "Camera & Lens",
        optionsJson: JSON.stringify(["Extreme Wide (EWS)", "Wide Shot (WS)", "Medium Wide (MWS)", "Medium Shot (MS)", "Medium Close-Up (MCU)", "Close-Up (CU)", "Extreme Close-Up (ECU)"]),
      },
      {
        key: "movement",
        label: "Movement",
        type: "select",
        category: "Camera & Lens",
        optionsJson: JSON.stringify(["Static", "Pan Left", "Pan Right", "Tilt Up", "Tilt Down", "Push In", "Pull Out", "Tracking / Dolly", "Handheld"]),
      },
    ];

    for (const prop of defaultProps) {
      await tx.propertyDefinition.create({
        data: {
          ownerId: createdUser.id,
          key: prop.key,
          label: prop.label,
          type: prop.type,
          category: prop.category,
          optionsJson: prop.optionsJson,
          isDefault: true,
        },
      });
    }

    return createdUser;
  });

  await writeAuditLog({
    action: "INVITATION_REDEEMED",
    actorId: user.id,
    actorEmail: user.email,
    targetType: "AccountInvitation",
    targetId: verification.invitation.id,
    details: {
      role: user.role,
      invitationId: verification.invitation.id,
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  await writeAuditLog({
    action: "USER_REGISTERED",
    actorId: user.id,
    actorEmail: user.email,
    targetType: "User",
    targetId: user.id,
    details: {
      email: user.email,
      role: user.role,
      admissionMethod: "INVITATION_CODE",
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return user;
}

export async function revokeInvitation(params: {
  id: string;
  actorId?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const existing = await prisma.accountInvitation.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    throw new InvitationError(404, "NOT_FOUND", "Invitation not found.");
  }
  if (existing.status !== "PENDING") {
    throw new InvitationError(
      400,
      "INVALID_STATUS",
      `Cannot revoke an invitation with status ${existing.status}.`
    );
  }

  const updated = await prisma.accountInvitation.update({
    where: { id: params.id },
    data: {
      status: "REVOKED",
      revokedAt: new Date(),
    },
  });

  await writeAuditLog({
    action: "INVITATION_REVOKED",
    actorId: params.actorId || null,
    actorEmail: params.actorEmail || null,
    targetType: "AccountInvitation",
    targetId: updated.id,
    details: {
      invitedEmail: updated.normalizedEmail,
      previousStatus: existing.status,
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return updated;
}

export async function rotateInvitation(params: {
  id: string;
  expiresInHours?: number;
  actorId?: string | null;
  actorEmail?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const existing = await prisma.accountInvitation.findUnique({
    where: { id: params.id },
  });
  if (!existing) {
    throw new InvitationError(404, "NOT_FOUND", "Invitation not found.");
  }
  if (existing.status === "ACCEPTED") {
    throw new InvitationError(
      400,
      "ALREADY_ACCEPTED",
      "Cannot rotate an invitation that has already been redeemed."
    );
  }

  const now = new Date();
  const expiresInHours = Math.min(Math.max(params.expiresInHours ?? 72, 1), 720);
  const expiresAt = new Date(now.getTime() + expiresInHours * 3600 * 1000);
  const { rawToken, tokenHash } = generateInvitationToken();

  const updated = await prisma.$transaction(async (tx) => {
    if (existing.status === "PENDING") {
      await tx.accountInvitation.update({
        where: { id: existing.id },
        data: {
          status: "REVOKED",
          revokedAt: now,
        },
      });
    }

    return tx.accountInvitation.create({
      data: {
        email: existing.email,
        normalizedEmail: existing.normalizedEmail,
        tokenHash,
        role: existing.role,
        status: "PENDING",
        expiresAt,
        notes: existing.notes,
        invitedById: params.actorId || existing.invitedById,
      },
    });
  });

  await writeAuditLog({
    action: "INVITATION_ROTATED",
    actorId: params.actorId || null,
    actorEmail: params.actorEmail || null,
    targetType: "AccountInvitation",
    targetId: updated.id,
    details: {
      previousInvitationId: existing.id,
      invitedEmail: updated.normalizedEmail,
      expiresAt: expiresAt.toISOString(),
    },
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });

  return {
    invitation: updated,
    rawToken,
  };
}

export async function listInvitations(statusFilter?: string) {
  await expireStaleInvitations();
  return prisma.accountInvitation.findMany({
    where:
      statusFilter && statusFilter !== "ALL"
        ? { status: statusFilter }
        : undefined,
    orderBy: { createdAt: "desc" },
    include: {
      invitedBy: {
        select: { id: true, name: true, email: true },
      },
      acceptedByUser: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
    },
  });
}
