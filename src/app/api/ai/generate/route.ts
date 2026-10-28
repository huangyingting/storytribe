import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";
import { CHARACTER_PRESETS } from "@/lib/catalog/storytribe-assets";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const generations = await prisma.aiGeneration.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ generations });
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const generationType = String(body.generationType || "IMAGE").toUpperCase();
  const prompt = String(body.prompt || "Storyboard scene composition").trim();
  const style = String(body.style || "Storyboard Sketch");
  const model = String(body.model || "Tribe-Vision-3");
  const aspectRatio = String(body.aspectRatio || "16:9");
  const noBackground = Boolean(body.noBackground);

  let resultPayload: Record<string, any> = {};

  if (generationType === "SYNOPSIS") {
    const projectTitle = String(body.projectTitle || "Untitled Project");
    const scenesSummary = String(body.scenesSummary || prompt);
    resultPayload = {
      synopsis: `${projectTitle} follows a visually driven narrative centered around ${scenesSummary}. Through deliberate camera staging, character blocking, and expressive visual beats, the story builds emotional momentum from its establishing setup to a memorable closing frame.`,
    };
  } else if (generationType === "SCRIPT") {
    resultPayload = {
      blocks: [
        {
          id: `ai-blk-${crypto.randomBytes(3).toString("hex")}`,
          type: "action",
          text: `${prompt} — Camera tracks smoothly across the scene as natural light shapes the foreground.`,
        },
        {
          id: `ai-blk-${crypto.randomBytes(3).toString("hex")}`,
          type: "character",
          text: "MAYA",
        },
        {
          id: `ai-blk-${crypto.randomBytes(3).toString("hex")}`,
          type: "dialogue",
          text: `Look closely at the frame—this is where "${prompt.slice(0, 48)}" comes alive.`,
        },
      ],
    };
  } else if (generationType === "VOICEOVER") {
    resultPayload = {
      track: {
        id: `vt-${crypto.randomBytes(4).toString("hex")}`,
        name: `AI Voiceover (${body.voiceId || "Studio Narrator"})`,
        startTime: Number(body.startTime || 0),
        duration: Math.max(2, Math.min(12, Math.ceil(prompt.split(/\s+/).length * 0.45))),
        volume: 95,
        script: prompt,
        voiceId: String(body.voiceId || "nova-narrator"),
      },
    };
  } else {
    // IMAGE / CANVAS OBJECT synthesis
    const lower = prompt.toLowerCase();
    const presetChar =
      CHARACTER_PRESETS.find((c) =>
        lower.includes(c.name.split(" ")[0].toLowerCase())
      ) || CHARACTER_PRESETS[Math.floor(Math.random() * CHARACTER_PRESETS.length)];

    const sceneKey = lower.includes("street") || lower.includes("city")
      ? "city-street"
      : lower.includes("office") || lower.includes("desk")
      ? "modern-office"
      : lower.includes("living") || lower.includes("home")
      ? "living-room"
      : "coffee-shop";

    const objects = [];
    if (!noBackground) {
      objects.push({
        id: `ai-bg-${crypto.randomBytes(4).toString("hex")}`,
        type: "scene",
        name: `AI Scene (${style}): ${prompt.slice(0, 28)}`,
        x: 0,
        y: 0,
        width: 1920,
        height: 1080,
        rotation: 0,
        opacity: 1,
        locked: false,
        visible: true,
        zIndex: 1,
        props: {
          presetKey: sceneKey,
          aiStyle: style,
          prompt,
        },
      });
    }

    objects.push({
      id: `ai-char-${crypto.randomBytes(4).toString("hex")}`,
      type: "character",
      name: `AI ${presetChar.name}`,
      x: 720,
      y: 260,
      width: 300,
      height: 540,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      props: {
        rig: {
          ...presetChar.rig,
          pose: lower.includes("walk")
            ? "walking"
            : lower.includes("sit")
            ? "sitting"
            : lower.includes("point")
            ? "pointing"
            : "talking",
        },
      },
    });

    objects.push({
      id: `ai-caption-${crypto.randomBytes(4).toString("hex")}`,
      type: "speech",
      name: "AI Story Beat",
      x: 980,
      y: 160,
      width: 420,
      height: 110,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 3,
      props: {
        bubbleType: "speech-oval",
        text: prompt.slice(0, 64),
        fill: "#ffffff",
        stroke: "#111827",
      },
    });

    resultPayload = {
      objects,
      style,
      model,
      aspectRatio,
    };
  }

  const record = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: user.id },
      data: {
        aiCredits: { decrement: 1 },
      },
    });

    return tx.aiGeneration.create({
      data: {
        userId: user.id,
        projectId: body.projectId ? String(body.projectId) : null,
        stageId: body.stageId ? String(body.stageId) : null,
        generationType,
        prompt,
        style,
        model,
        aspectRatio,
        creditsUsed: 1,
        resultData: JSON.stringify(resultPayload),
      },
    });
  });

  return NextResponse.json({
    generation: record,
    result: resultPayload,
    synopsis: resultPayload.synopsis,
    scriptContent: Array.isArray(resultPayload.blocks)
      ? `INT. STUDIO - DAY\n${resultPayload.blocks.map((b: any) => b.text).join("\n")}`
      : undefined,
    canvasObjects: resultPayload.objects,
  });
}
