import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { loadFullProject } from "@/lib/project-serializer";

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const original = await loadFullProject(id);
  if (!original) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const stageIdMap = new Map<string, string>();
  for (const st of original.stages) {
    stageIdMap.set(st.id, `st-${crypto.randomBytes(6).toString("hex")}`);
  }

  const newScenes = original.scenes.map((sc) => ({
    ...sc,
    id: `sc-${crypto.randomBytes(4).toString("hex")}`,
    shotIds: sc.shotIds.map((oldId) => stageIdMap.get(oldId) || oldId),
  }));

  const newStageOrder = original.stageOrder.map(
    (oldId) => stageIdMap.get(oldId) || oldId
  );

  const dupProject = await prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: {
        title: `${original.title} (Copy)`,
        synopsis: original.synopsis,
        coverImage: original.coverImage,
        coverPalette: original.coverPalette,
        ownerId: user.id,
        workspaceId: original.workspaceId,
        width: original.width,
        height: original.height,
        annotationFieldsJson: JSON.stringify(original.annotationFields),
        scenesJson: JSON.stringify(newScenes),
        stageOrderJson: JSON.stringify(newStageOrder),
        shareToken: crypto.randomBytes(6).toString("base64url").slice(0, 8),
      },
    });

    for (let i = 0; i < original.stages.length; i++) {
      const st = original.stages[i];
      await tx.stage.create({
        data: {
          id: stageIdMap.get(st.id)!,
          projectId: created.id,
          title: st.title,
          sortOrder: i,
          bkgdColor: st.bkgdColor,
          width: st.width,
          height: st.height,
          annotationsJson: JSON.stringify(st.annotations),
          scriptBlocksJson: JSON.stringify(st.scriptBlocks),
          objectsJson: JSON.stringify(st.objects),
          groupsJson: JSON.stringify(st.groups),
          thumbnailData: st.thumbnailData,
        },
      });
    }

    return created;
  });

  const full = await loadFullProject(dupProject.id);
  return NextResponse.json({ project: full }, { status: 201 });
}
