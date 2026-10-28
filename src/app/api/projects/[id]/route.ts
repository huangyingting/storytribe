import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { loadFullProject } from "@/lib/project-serializer";

async function canAccessProject(projectId: string, userId?: string, userEmail?: string | null) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { guests: true },
  });
  if (!project) return { allowed: false, canEdit: false, project: null };

  if (userId && project.ownerId === userId) {
    return { allowed: true, canEdit: true, project };
  }

  if (userId || userEmail) {
    const guest = project.guests.find(
      (g) => (userId && g.userId === userId) || (userEmail && g.email === userEmail)
    );
    if (guest) {
      return {
        allowed: true,
        canEdit: guest.permission === "EDIT",
        project,
      };
    }
  }

  if (project.isPublic && project.shareAccess !== "off") {
    return { allowed: true, canEdit: false, project };
  }

  return { allowed: false, canEdit: false, project: null };
}

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  const access = await canAccessProject(id, user?.id, user?.email);

  if (!access.allowed) {
    return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
  }

  const fullProject = await loadFullProject(id);
  return NextResponse.json({ project: fullProject, canEdit: access.canEdit });
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const access = await canAccessProject(id, user.id, user.email);
  if (!access.allowed || !access.canEdit) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();

  await prisma.$transaction(async (tx) => {
    await tx.project.update({
      where: { id },
      data: {
        title: body.title !== undefined ? String(body.title) : undefined,
        synopsis: body.synopsis !== undefined ? String(body.synopsis) : undefined,
        coverImage: body.coverImage !== undefined ? body.coverImage : undefined,
        coverPalette:
          body.coverPalette !== undefined ? String(body.coverPalette) : undefined,
        width: body.width !== undefined ? Number(body.width) : undefined,
        height: body.height !== undefined ? Number(body.height) : undefined,
        annotationFieldsJson: Array.isArray(body.annotationFields)
          ? JSON.stringify(body.annotationFields)
          : undefined,
        scenesJson: Array.isArray(body.scenes)
          ? JSON.stringify(body.scenes)
          : undefined,
        stageOrderJson: Array.isArray(body.stageOrder)
          ? JSON.stringify(body.stageOrder)
          : undefined,
      },
    });

    if (Array.isArray(body.stages)) {
      const incomingIds = body.stages.map((s: any) => String(s.id));
      await tx.stage.deleteMany({
        where: {
          projectId: id,
          id: { notIn: incomingIds },
        },
      });

      for (let i = 0; i < body.stages.length; i++) {
        const st = body.stages[i];
        const mergedAnnotations = {
          ...(st.annotations || {}),
          ...(st.propertyValues || {}),
          durationSec: st.durationSec || st.annotations?.durationSec || 3,
        };
        const mergedObjects = st.canvasObjects || st.objects || [];
        const bgColor = st.backgroundColor || st.bkgdColor || "#fffdf9";
        await tx.stage.upsert({
          where: { id: String(st.id) },
          create: {
            id: String(st.id),
            projectId: id,
            title: String(st.title || `Shot ${i + 1}`),
            sortOrder: i,
            bkgdColor: String(bgColor),
            width: Number(st.width || body.width || 1920),
            height: Number(st.height || body.height || 1080),
            annotationsJson: JSON.stringify(mergedAnnotations),
            scriptBlocksJson: JSON.stringify(st.scriptBlocks || []),
            objectsJson: JSON.stringify(mergedObjects),
            groupsJson: JSON.stringify(st.groups || {}),
            thumbnailData: st.thumbnailData || null,
          },
          update: {
            title: String(st.title || `Shot ${i + 1}`),
            sortOrder: i,
            bkgdColor: String(bgColor),
            width: Number(st.width || body.width || 1920),
            height: Number(st.height || body.height || 1080),
            annotationsJson: JSON.stringify(mergedAnnotations),
            scriptBlocksJson: JSON.stringify(st.scriptBlocks || []),
            objectsJson: JSON.stringify(mergedObjects),
            groupsJson: JSON.stringify(st.groups || {}),
            thumbnailData: st.thumbnailData !== undefined ? st.thumbnailData : undefined,
          },
        });
      }
    }

    if (body.videoProject) {
      const vp = body.videoProject;
      const voiceList = vp.voiceoverTracks || vp.voiceTracks || [];
      const audioList = vp.musicTracks || vp.audioTracks || [];
      await tx.videoProject.upsert({
        where: { projectId: id },
        create: {
          projectId: id,
          ownerId: user.id,
          framesJson: JSON.stringify(vp.frames || []),
          settingsJson: JSON.stringify(
            vp.settings || {
              defaultDuration: 3,
              transition: "none",
              resolution: "1080p",
              fps: 30,
              musicVolume: 80,
            }
          ),
          voiceTracksJson: JSON.stringify(voiceList),
          audioTracksJson: JSON.stringify(audioList),
          videoClipsJson: JSON.stringify(vp.videoClips || []),
          shareToken:
            vp.shareToken || crypto.randomBytes(6).toString("base64url").slice(0, 8),
          isPublic: Boolean(vp.isPublic),
        },
        update: {
          framesJson: JSON.stringify(vp.frames || []),
          settingsJson: JSON.stringify(vp.settings || {}),
          voiceTracksJson: JSON.stringify(voiceList),
          audioTracksJson: JSON.stringify(audioList),
          videoClipsJson: JSON.stringify(vp.videoClips || []),
          isPublic: vp.isPublic !== undefined ? Boolean(vp.isPublic) : undefined,
        },
      });
    }
  });

  const updated = await loadFullProject(id);
  return NextResponse.json({ project: updated });
}

export async function DELETE(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const project = await prisma.project.findUnique({ where: { id } });
  if (!project || project.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.project.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
