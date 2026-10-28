import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import {
  buildDefaultStageObjects,
  loadFullProject,
  parseScreenplayText,
} from "@/lib/project-serializer";
import { writeAuditLog } from "@/lib/account-admission";

export async function GET(req: NextRequest) {
  const user = await getSessionUser();
  const scope = req.nextUrl.searchParams.get("scope") || "mine";
  const workspaceId = req.nextUrl.searchParams.get("workspaceId") || undefined;

  if (scope === "community") {
    const publicProjects = await prisma.project.findMany({
      where: {
        OR: [{ isPublishedToCommunity: true }, { isPublic: true }],
      },
      orderBy: { updatedAt: "desc" },
      include: {
        owner: { select: { id: true, name: true, username: true, email: true } },
        stages: { orderBy: { sortOrder: "asc" }, take: 3 },
        videoProject: { select: { shareToken: true } },
      },
    });
    return NextResponse.json({ projects: publicProjects });
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (scope === "shared") {
    const guests = await prisma.projectGuest.findMany({
      where: {
        OR: [{ userId: user.id }, { email: user.email || "" }],
      },
      include: {
        project: {
          include: {
            owner: { select: { id: true, name: true, email: true, username: true } },
            stages: { orderBy: { sortOrder: "asc" }, take: 3 },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      projects: guests.map((g) => ({
        ...g.project,
        guestPermission: g.permission,
      })),
    });
  }

  const projects = await prisma.project.findMany({
    where: workspaceId
      ? { workspaceId }
      : { ownerId: user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      stages: {
        orderBy: { sortOrder: "asc" },
      },
      workspace: {
        select: { id: true, name: true, slug: true },
      },
    },
  });

  return NextResponse.json({ projects });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const mode = String(body.mode || "blank");
  const title = String(body.title || "Untitled Storyboard").trim() || "Untitled Storyboard";
  const width = Math.min(Math.max(Number(body.width) || 1920, 200), 6000);
  const height = Math.min(Math.max(Number(body.height) || 1080, 200), 6000);
  const workspaceId = body.workspaceId ? String(body.workspaceId) : null;
  const shareToken = crypto.randomBytes(6).toString("base64url").slice(0, 8);

  let synopsis = String(body.synopsis || "");
  let initialScenes: Array<{
    sceneTitle: string;
    sceneDesc: string;
    shots: Array<{
      title: string;
      scriptBlocks: Array<{ id: string; type: "action" | "character" | "dialogue"; text: string }>;
      annotations: Record<string, string>;
    }>;
  }> = [];

  if (mode === "import-script" && body.scriptText) {
    initialScenes = parseScreenplayText(String(body.scriptText)) as any;
    synopsis =
      synopsis ||
      `Imported screenplay containing ${initialScenes.length} scene(s).`;
  } else if (mode === "ai-wizard") {
    const prompt = String(body.prompt || "A brand commercial about morning coffee");
    synopsis = `AI-generated production breakdown for: ${prompt}`;
    initialScenes = [
      {
        sceneTitle: "INT. COFFEE SHOP - MORNING",
        sceneDesc: `Opening setup inspired by: ${prompt}`,
        shots: [
          {
            title: "Establishing Shot - Warm Interior",
            scriptBlocks: [
              {
                id: "blk-1",
                type: "action",
                text: `Golden morning light fills the frame as ${prompt.toLowerCase()} begins.`,
              },
              { id: "blk-2", type: "character", text: "PROTAGONIST" },
              {
                id: "blk-3",
                type: "dialogue",
                text: "Every great story starts with a clear vision.",
              },
            ],
            annotations: {
              visualdetail: `Wide establishing shot for ${prompt}`,
              dialogue: "PROTAGONIST: Every great story starts with a clear vision.",
              cameraangle: "Eye Level",
              shotsize: "Wide Shot (WS)",
              movement: "Push In",
            },
          },
          {
            title: "Close-Up - Key Action Detail",
            scriptBlocks: [
              {
                id: "blk-4",
                type: "action",
                text: "Camera focuses tightly on the hero subject in crisp detail.",
              },
            ],
            annotations: {
              visualdetail: "Macro close-up highlighting texture and emotion.",
              dialogue: "",
              cameraangle: "High Angle",
              shotsize: "Close-Up (CU)",
              movement: "Static",
            },
          },
        ],
      },
      {
        sceneTitle: "EXT. CITY STREET - DAY",
        sceneDesc: "Resolution and call-to-action finale.",
        shots: [
          {
            title: "Hero Finale Shot",
            scriptBlocks: [
              {
                id: "blk-5",
                type: "action",
                text: "Protagonist steps forward confidently as the title card appears.",
              },
            ],
            annotations: {
              visualdetail: "Medium tracking shot with depth of field.",
              dialogue: "",
              cameraangle: "Low Angle",
              shotsize: "Medium Shot (MS)",
              movement: "Tracking / Dolly",
            },
          },
        ],
      },
    ];
  } else if (mode === "template") {
    const templateId = String(body.templateId || "commercial");
    synopsis = `Created from StoryTribe ${templateId} production template.`;
    initialScenes = [
      {
        sceneTitle: "INT. STUDIO SET - DAY",
        sceneDesc: "Act I — Hook & Problem Introduction",
        shots: [
          {
            title: "The Hook — Wide Opening",
            scriptBlocks: [
              {
                id: "blk-t1",
                type: "action",
                text: "Subject looks directly into the lens as studio lights flare.",
              },
              { id: "blk-t2", type: "character", text: "NARRATOR" },
              {
                id: "blk-t3",
                type: "dialogue",
                text: "What if pre-production took minutes instead of weeks?",
              },
            ],
            annotations: {
              visualdetail: "Clean studio background with main character centered.",
              dialogue: "NARRATOR: What if pre-production took minutes instead of weeks?",
              cameraangle: "Eye Level",
              shotsize: "Medium Wide (MWS)",
              movement: "Push In",
            },
          },
          {
            title: "Product Reveal Close-Up",
            scriptBlocks: [
              {
                id: "blk-t4",
                type: "action",
                text: "Hands demonstrate the storyboard canvas workflow smoothly.",
              },
            ],
            annotations: {
              visualdetail: "Over-the-shoulder view of the storyboard workspace.",
              dialogue: "",
              cameraangle: "Over the Shoulder",
              shotsize: "Close-Up (CU)",
              movement: "Pan Right",
            },
          },
        ],
      },
    ];
  } else {
    // Blank project starts with Scene 1 and Shot 1.1 ready to edit
    initialScenes = [
      {
        sceneTitle: "INT. LOCATION - DAY",
        sceneDesc: "Scene 1 description",
        shots: [
          {
            title: "Shot 1.1",
            scriptBlocks: [
              {
                id: "blk-init-1",
                type: "action",
                text: "Describe the action and staging for this shot...",
              },
            ],
            annotations: {
              visualdetail: "",
              dialogue: "",
              cameraangle: "Eye Level",
              shotsize: "Medium Shot (MS)",
              movement: "Static",
            },
          },
        ],
      },
    ];
  }

  const createdProjectId = await prisma.$transaction(async (tx) => {
    const proj = await tx.project.create({
      data: {
        title,
        synopsis,
        ownerId: user.id,
        workspaceId,
        width,
        height,
        shareToken,
      },
    });

    const scenesData = [];
    const stageOrder: string[] = [];
    let globalSort = 0;

    for (let sIdx = 0; sIdx < initialScenes.length; sIdx++) {
      const sc = initialScenes[sIdx];
      const shotIds: string[] = [];

      for (let shIdx = 0; shIdx < sc.shots.length; shIdx++) {
        const sh = sc.shots[shIdx];
        const objects =
          mode === "blank"
            ? []
            : buildDefaultStageObjects(globalSort, sh.title, width, height);

        const createdStage = await tx.stage.create({
          data: {
            projectId: proj.id,
            title: sh.title,
            sortOrder: globalSort,
            width,
            height,
            bkgdColor: "#fffdf9",
            annotationsJson: JSON.stringify(sh.annotations),
            scriptBlocksJson: JSON.stringify(sh.scriptBlocks),
            objectsJson: JSON.stringify(objects),
          },
        });

        shotIds.push(createdStage.id);
        stageOrder.push(createdStage.id);
        globalSort++;
      }

      scenesData.push({
        id: `sc-${sIdx + 1}-${crypto.randomBytes(3).toString("hex")}`,
        title: sc.sceneTitle,
        description: sc.sceneDesc,
        shotIds,
      });
    }

    await tx.project.update({
      where: { id: proj.id },
      data: {
        scenesJson: JSON.stringify(scenesData),
        stageOrderJson: JSON.stringify(stageOrder),
      },
    });

    return proj.id;
  });

  await writeAuditLog({
    action: "PROJECT_CREATED",
    actorId: user.id,
    actorEmail: user.email,
    targetType: "Project",
    targetId: createdProjectId,
    details: { title, mode, width, height },
  });

  const fullProject = await loadFullProject(createdProjectId);
  return NextResponse.json({ project: fullProject }, { status: 201 });
}
