import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [followers, following, directory] = await Promise.all([
    prisma.userFollow.findMany({
      where: { followingId: user.id },
      include: {
        follower: {
          select: { id: true, name: true, username: true, email: true, bio: true },
        },
      },
    }),
    prisma.userFollow.findMany({
      where: { followerId: user.id },
      include: {
        following: {
          select: { id: true, name: true, username: true, email: true, bio: true },
        },
      },
    }),
    prisma.user.findMany({
      where: { id: { not: user.id } },
      select: {
        id: true,
        name: true,
        username: true,
        bio: true,
        _count: { select: { projects: true, followers: true } },
      },
      take: 25,
    }),
  ]);

  return NextResponse.json({
    followers: followers.map((f) => f.follower),
    following: following.map((f) => f.following),
    directory,
  });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const targetUserId = String(body.targetUserId || "");
  if (!targetUserId || targetUserId === user.id) {
    return NextResponse.json({ error: "Invalid target user" }, { status: 400 });
  }

  const existing = await prisma.userFollow.findUnique({
    where: {
      followerId_followingId: {
        followerId: user.id,
        followingId: targetUserId,
      },
    },
  });

  if (existing) {
    await prisma.userFollow.delete({ where: { id: existing.id } });
    return NextResponse.json({ following: false });
  }

  await prisma.userFollow.create({
    data: {
      followerId: user.id,
      followingId: targetUserId,
    },
  });

  await prisma.notification.create({
    data: {
      userId: targetUserId,
      type: "FOLLOW",
      title: "New follower",
      message: `${user.name || user.email} started following your storyboards.`,
      linkUrl: `/app/connections`,
    },
  });

  return NextResponse.json({ following: true });
}
