import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const username = req.nextUrl.searchParams.get("username");
  if (username) {
    const publicUser = await prisma.user.findFirst({
      where: {
        OR: [{ username }, { id: username }],
      },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        image: true,
        role: true,
        plan: true,
        createdAt: true,
        projects: {
          where: { isPublic: true },
          orderBy: { updatedAt: "desc" },
          include: {
            stages: { orderBy: { sortOrder: "asc" }, take: 2 },
          },
        },
        _count: {
          select: { followers: true, following: true, projects: true },
        },
      },
    });
    if (!publicUser) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }
    return NextResponse.json({ profile: publicUser });
  }

  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      image: true,
      role: true,
      aiCredits: true,
      plan: true,
      notificationPrefsJson: true,
      createdAt: true,
      _count: {
        select: { followers: true, following: true, projects: true },
      },
    },
  });

  return NextResponse.json({ profile: user });
}

export async function PUT(req: NextRequest) {
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const data: Record<string, any> = {};

  if (body.name !== undefined) data.name = String(body.name).trim();
  if (body.bio !== undefined) data.bio = String(body.bio).trim();
  if (body.username !== undefined) {
    const cleanUsername = String(body.username)
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "");
    if (cleanUsername) data.username = cleanUsername;
  }
  if (body.plan !== undefined && ["FREE", "CREATOR_PRO", "STUDIO"].includes(body.plan)) {
    data.plan = body.plan;
  }
  if (body.notificationPrefs !== undefined) {
    data.notificationPrefsJson = JSON.stringify(body.notificationPrefs);
  }
  if (body.newPassword) {
    if (String(body.newPassword).length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }
    data.passwordHash = await bcrypt.hash(String(body.newPassword), 12);
  }

  const updated = await prisma.user.update({
    where: { id: sessionUser.id },
    data,
    select: {
      id: true,
      name: true,
      username: true,
      email: true,
      bio: true,
      role: true,
      aiCredits: true,
      plan: true,
      notificationPrefsJson: true,
    },
  });

  return NextResponse.json({ profile: updated });
}
