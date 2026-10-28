import type { StageData } from "@/types/storytribe";

export function parseScriptToStages(scriptText: string): StageData[] {
  const lines = scriptText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const stages: StageData[] = [];
  let sceneNum = 1;
  let currentHeading = "INT. STUDIO - DAY";
  let actionBuffer: string[] = [];

  const flushStage = () => {
    if (actionBuffer.length === 0) return;
    const summary = actionBuffer.join(" ");
    const idx = stages.length;
    stages.push({
      id: `stage_${Date.now()}_${idx}`,
      orderIndex: idx,
      sortOrder: idx,
      sceneNumber: sceneNum,
      shotNumber: idx + 1,
      title: `${currentHeading} — Shot ${idx + 1}`,
      synopsis: summary,
      scriptContent: summary,
      durationSec: 3,
      backgroundColor: "#FFFBEB",
      bkgdColor: "#FFFBEB",
      canvasObjects: [],
      objects: [],
      propertyValues: {
        visualdetail: summary,
        cameraangle: idx % 2 === 0 ? "Eye Level" : "High Angle",
        shotsize: idx === 0 ? "Wide Shot (WS)" : "Medium Shot (MS)",
        movement: "Static",
      },
      annotations: {
        visualdetail: summary,
        cameraangle: idx % 2 === 0 ? "Eye Level" : "High Angle",
        shotsize: idx === 0 ? "Wide Shot (WS)" : "Medium Shot (MS)",
        movement: "Static",
      },
    });
    actionBuffer = [];
  };

  for (const line of lines) {
    if (/^(INT\.|EXT\.|INT\/EXT\.|SCENE\s+\d+)/i.test(line)) {
      flushStage();
      currentHeading = line.toUpperCase();
      sceneNum += stages.length > 0 ? 1 : 0;
    } else {
      actionBuffer.push(line);
      if (actionBuffer.length >= 2) {
        flushStage();
      }
    }
  }
  flushStage();

  return stages;
}
