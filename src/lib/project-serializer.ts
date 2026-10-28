import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import {
  CanvasObjectData,
  FullProjectData,
  SceneData,
  ScriptBlock,
  StageData,
  VideoProjectData,
} from "@/types/storytribe";
import { CHARACTER_PRESETS } from "@/lib/catalog/storytribe-assets";

function safeParseJson<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function loadFullProject(projectId: string): Promise<FullProjectData | null> {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      stages: {
        orderBy: { sortOrder: "asc" },
      },
      elements: {
        orderBy: { createdAt: "asc" },
      },
      comments: {
        orderBy: { createdAt: "asc" },
      },
      videoProject: true,
    },
  });

  if (!project) return null;

  const annotationFields = safeParseJson<string[]>(project.annotationFieldsJson, [
    "visualdetail",
    "dialogue",
    "cameraangle",
    "shotsize",
    "movement",
  ]);

  const stages: StageData[] = project.stages.map((st, idx) => {
    const parsedAnnotations = safeParseJson<Record<string, string>>(
      st.annotationsJson,
      {}
    );
    const parsedObjects = safeParseJson<CanvasObjectData[]>(st.objectsJson, []);
    const parsedBlocks = safeParseJson<ScriptBlock[]>(st.scriptBlocksJson, []);
    return {
      id: st.id,
      projectId: st.projectId,
      title: st.title,
      sortOrder: st.sortOrder,
      orderIndex: st.sortOrder ?? idx,
      sceneNumber: 1,
      shotNumber: idx + 1,
      durationSec: Number(parsedAnnotations.durationSec) || 3,
      synopsis: parsedAnnotations.visualdetail || "",
      scriptContent: parsedBlocks.map((b) => b.text).join("\n"),
      bkgdColor: st.bkgdColor,
      backgroundColor: st.bkgdColor || "#FFFBEB",
      width: st.width,
      height: st.height,
      annotations: parsedAnnotations,
      propertyValues: parsedAnnotations,
      scriptBlocks: parsedBlocks,
      objects: parsedObjects,
      canvasObjects: parsedObjects,
      groups: safeParseJson<Record<string, string[]>>(st.groupsJson, {}),
      thumbnailData: st.thumbnailData,
      thumbnailSvg: st.thumbnailData,
    };
  });

  let scenes = safeParseJson<SceneData[]>(project.scenesJson, []);
  if (scenes.length === 0 && stages.length > 0) {
    scenes = [
      {
        id: "scene-1",
        title: "INT. STUDIO - DAY",
        description: "Opening sequence.",
        shotIds: stages.map((s) => s.id),
      },
    ];
  }

  const stageOrder = safeParseJson<string[]>(
    project.stageOrderJson,
    stages.map((s) => s.id)
  );

  let videoProject: VideoProjectData | null = null;
  if (project.videoProject) {
    const vp = project.videoProject;
    const rawFrames = safeParseJson<any[]>(vp.framesJson, []);
    const rawVoice = safeParseJson<any[]>(vp.voiceTracksJson, []);
    const rawAudio = safeParseJson<any[]>(vp.audioTracksJson, []);
    videoProject = {
      id: vp.id,
      projectId: vp.projectId,
      isInitialized: rawFrames.length > 0,
      fps: 24,
      aspectRatio: "16:9",
      frames: rawFrames.map((f, i) => ({
        ...f,
        id: f.id || `vf_${i}`,
        stageId: f.stageId || f.frameId || stages[i]?.id,
        durationSec: f.durationSec || f.duration || 3,
        transition: f.transition || "NONE",
      })),
      settings: safeParseJson(vp.settingsJson, {
        defaultDuration: 3,
        transition: "none",
        resolution: "1080p",
        fps: 30,
        musicVolume: 80,
      }),
      voiceTracks: rawVoice,
      voiceoverTracks: rawVoice,
      audioTracks: rawAudio,
      musicTracks: rawAudio,
      videoClips: safeParseJson(vp.videoClipsJson, []),
      shareToken: vp.shareToken,
      isPublic: vp.isPublic,
    };
  }

  return {
    id: project.id,
    title: project.title,
    synopsis: project.synopsis,
    scriptContent: stages.map((s) => s.scriptContent).filter(Boolean).join("\n\n"),
    visualStyle: "color-shaded",
    aspectRatio: `${project.width}:${project.height}` === "1920:1080" ? "16:9" : "Custom",
    coverImage: project.coverImage,
    coverPalette: project.coverPalette,
    ownerId: project.ownerId,
    workspaceId: project.workspaceId,
    width: project.width,
    height: project.height,
    annotationFields,
    scenes,
    stageOrder,
    stages,
    elements: project.elements.map((el) => ({
      id: el.id,
      name: el.name,
      handle: el.handle,
      category: el.category as "CHARACTER" | "PROP" | "BACKGROUND",
      description: el.description,
      svgData: el.svgData,
      projectId: el.projectId,
      workspaceId: el.workspaceId,
    })),
    comments: project.comments.map((cm) => ({
      id: cm.id,
      projectId: cm.projectId,
      stageId: cm.stageId,
      authorId: cm.authorId,
      authorName: cm.authorName,
      content: cm.content,
      x: cm.x,
      y: cm.y,
      pinX: cm.x,
      pinY: cm.y,
      resolved: cm.resolved,
      parentId: cm.parentId,
      createdAt: cm.createdAt.toISOString(),
    })),
    videoProject,
    shareToken: project.shareToken,
    isPublic: project.isPublic,
    shareAccess: (project.shareAccess as "off" | "view" | "comment") || "off",
    isPublishedToCommunity: project.isPublishedToCommunity,
    likesCount: project.likesCount,
    updatedAt: project.updatedAt.toISOString(),
  };
}

export function parseScreenplayText(scriptText: string): Array<{
  sceneTitle: string;
  sceneDesc: string;
  shots: Array<{
    title: string;
    scriptBlocks: ScriptBlock[];
    annotations: Record<string, string>;
  }>;
}> {
  const lines = scriptText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const parsedScenes: Array<{
    sceneTitle: string;
    sceneDesc: string;
    shots: Array<{
      title: string;
      scriptBlocks: ScriptBlock[];
      annotations: Record<string, string>;
    }>;
  }> = [];

  let currentScene = {
    sceneTitle: "INT. LOCATION - DAY",
    sceneDesc: "Imported screenplay scene",
    shots: [] as Array<{
      title: string;
      scriptBlocks: ScriptBlock[];
      annotations: Record<string, string>;
    }>,
  };

  let currentShotBlocks: ScriptBlock[] = [];
  let pendingCharacter: string | null = null;

  const flushShot = (label?: string) => {
    if (currentShotBlocks.length === 0) return;
    const firstAction = currentShotBlocks.find((b) => b.type === "action")?.text;
    const firstDialogue = currentShotBlocks.find((b) => b.type === "dialogue")?.text;
    currentScene.shots.push({
      title:
        label ||
        (firstAction ? firstAction.slice(0, 42) : `Shot ${currentScene.shots.length + 1}`),
      scriptBlocks: currentShotBlocks,
      annotations: {
        visualdetail: firstAction || "Framed scene composition.",
        dialogue: firstDialogue || "",
        cameraangle: currentScene.shots.length % 2 === 0 ? "Eye Level" : "High Angle",
        shotsize: currentScene.shots.length === 0 ? "Wide Shot (WS)" : "Medium Shot (MS)",
        movement: "Static",
      },
    });
    currentShotBlocks = [];
  };

  for (const line of lines) {
    if (/^(INT\.|EXT\.|INT\/EXT\.|SCENE\s+\d+)/i.test(line)) {
      flushShot();
      if (currentScene.shots.length > 0) {
        parsedScenes.push(currentScene);
      }
      currentScene = {
        sceneTitle: line.replace(/^SCENE\s+\d+[:\s-]*/i, "").toUpperCase(),
        sceneDesc: `Imported scene: ${line}`,
        shots: [],
      };
      pendingCharacter = null;
    } else if (/^[A-Z][A-Z0-9\s]{1,24}$/.test(line) && !line.endsWith(".")) {
      pendingCharacter = line;
      currentShotBlocks.push({
        id: `blk-${crypto.randomBytes(4).toString("hex")}`,
        type: "character",
        text: line,
      });
    } else if (pendingCharacter) {
      currentShotBlocks.push({
        id: `blk-${crypto.randomBytes(4).toString("hex")}`,
        type: "dialogue",
        text: line,
      });
      pendingCharacter = null;
      if (currentShotBlocks.length >= 3) {
        flushShot();
      }
    } else {
      currentShotBlocks.push({
        id: `blk-${crypto.randomBytes(4).toString("hex")}`,
        type: "action",
        text: line,
      });
      if (currentShotBlocks.length >= 3) {
        flushShot();
      }
    }
  }

  flushShot();
  if (currentScene.shots.length === 0) {
    currentScene.shots.push({
      title: "Opening Establishing Shot",
      scriptBlocks: [
        {
          id: "blk-1",
          type: "action",
          text: scriptText.trim() || "Camera opens on the main setting.",
        },
      ],
      annotations: {
        visualdetail: scriptText.trim() || "Establishing wide view.",
        dialogue: "",
        cameraangle: "Eye Level",
        shotsize: "Wide Shot (WS)",
        movement: "Static",
      },
    });
  }
  parsedScenes.push(currentScene);
  return parsedScenes;
}

export function buildDefaultStageObjects(
  shotIndex: number,
  title: string,
  width: number,
  height: number
): CanvasObjectData[] {
  const preset = CHARACTER_PRESETS[shotIndex % CHARACTER_PRESETS.length];
  const sceneKeys = ["coffee-shop", "city-street", "modern-office", "living-room"];
  const sceneKey = sceneKeys[shotIndex % sceneKeys.length];

  return [
    {
      id: `obj-bg-${shotIndex}-${crypto.randomBytes(3).toString("hex")}`,
      type: "scene",
      name: `Scene Backdrop (${sceneKey})`,
      x: 0,
      y: 0,
      width,
      height,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 1,
      props: {
        presetKey: sceneKey,
      },
    },
    {
      id: `obj-char-${shotIndex}-${crypto.randomBytes(3).toString("hex")}`,
      type: "character",
      name: preset.name,
      x: Math.round(width * 0.35),
      y: Math.round(height * 0.25),
      width: 280,
      height: 520,
      rotation: 0,
      flipX: shotIndex % 2 === 1,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 2,
      props: {
        rig: preset.rig,
      },
    },
    {
      id: `obj-speech-${shotIndex}-${crypto.randomBytes(3).toString("hex")}`,
      type: "speech",
      name: "Speech Bubble",
      x: Math.round(width * 0.52),
      y: Math.round(height * 0.16),
      width: 340,
      height: 110,
      rotation: 0,
      opacity: 1,
      locked: false,
      visible: true,
      zIndex: 3,
      props: {
        bubbleType: "speech-oval",
        text: title,
        fill: "#ffffff",
        stroke: "#111827",
      },
    },
  ];
}
