import { prisma } from "@/lib/prisma";

export type AuditAction =
  | "INVITATION_CREATED"
  | "INVITATION_REDEEMED"
  | "INVITATION_REVOKED"
  | "INVITATION_ROTATED"
  | "USER_REGISTERED"
  | "USER_LOGIN_SUCCESS"
  | "USER_LOGIN_FAILED"
  | "USER_ROLE_CHANGED"
  | "PROJECT_CREATED"
  | "PROJECT_SHARED"
  | "PASSWORD_RESET_REQUESTED";

export interface WriteAuditLogInput {
  action: AuditAction | string;
  actorId?: string | null;
  actorEmail?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  details?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function writeAuditLog(input: WriteAuditLogInput) {
  try {
    return await prisma.auditLog.create({
      data: {
        action: input.action,
        actorId: input.actorId || null,
        actorEmail: input.actorEmail || null,
        targetType: input.targetType || null,
        targetId: input.targetId || null,
        details: input.details ? JSON.stringify(input.details) : null,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
      },
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
    return null;
  }
}

export async function listAuditLogs(options?: {
  action?: string;
  limit?: number;
}) {
  const limit = Math.min(Math.max(options?.limit ?? 100, 1), 500);
  return prisma.auditLog.findMany({
    where: options?.action ? { action: options.action } : undefined,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      actor: {
        select: { id: true, name: true, email: true, role: true },
      },
    },
  });
}
