import { FullProjectData, StageData } from "@/types/storytribe";

export type ExportLayoutPreset =
  | "one-per-page"
  | "three-per-page"
  | "grid-overview"
  | "images-only"
  | "screenplay"
  | "shot-list-table";

export type ExportFileFormat = "PDF" | "PPTX" | "PNG" | "CSV" | "JSON";

export interface ExportOptions {
  layout: ExportLayoutPreset;
  format: ExportFileFormat;
  includeTitlePage: boolean;
  includeScript: boolean;
  includeProperties: boolean;
  shotRange: "all" | "current";
  currentStageId?: string;
}

function getShotNumberMap(project: FullProjectData): Record<string, string> {
  const map: Record<string, string> = {};
  if (project.scenes.length > 0) {
    project.scenes.forEach((sc, scIdx) => {
      sc.shotIds.forEach((shotId, shIdx) => {
        map[shotId] = `${scIdx + 1}.${shIdx + 1}`;
      });
    });
  }
  project.stages.forEach((st, idx) => {
    if (!map[st.id]) {
      map[st.id] = `1.${idx + 1}`;
    }
  });
  return map;
}

export function generateCsvExport(project: FullProjectData): string {
  const shotNums = getShotNumberMap(project);
  const headers = [
    "Shot #",
    "Scene",
    "Title",
    "Script / Dialogue",
    "Visual Detail",
    "Camera Angle",
    "Shot Size",
    "Movement",
    ...project.annotationFields.filter(
      (f) =>
        !["visualdetail", "dialogue", "cameraangle", "shotsize", "movement"].includes(
          f
        )
    ),
  ];

  const escapeCsv = (val: string) =>
    `"${String(val ?? "").replace(/"/g, '""')}"`;

  const rows: string[] = [headers.map(escapeCsv).join(",")];

  for (const stage of project.stages) {
    const ann = stage.annotations || stage.propertyValues || {};
    const blocks = stage.scriptBlocks || [];
    const scene = project.scenes.find((s) => s.shotIds.includes(stage.id));
    const scriptText = blocks
      .map((b) => (b.type === "character" ? `${b.text}:` : b.text))
      .join(" ");

    const row = [
      shotNums[stage.id] || "1.1",
      scene?.title || "Scene 1",
      stage.title,
      scriptText || ann.dialogue || "",
      ann.visualdetail || "",
      ann.cameraangle || "",
      ann.shotsize || "",
      ann.movement || "",
      ...project.annotationFields
        .filter(
          (f) =>
            ![
              "visualdetail",
              "dialogue",
              "cameraangle",
              "shotsize",
              "movement",
            ].includes(f)
        )
        .map((k) => ann[k] || ""),
    ];
    rows.push(row.map(escapeCsv).join(","));
  }

  return rows.join("\n");
}

export function generatePrintableHtmlDocument(
  project: FullProjectData,
  options: ExportOptions
): string {
  const shotNums = getShotNumberMap(project);
  const stages: StageData[] =
    options.shotRange === "current" && options.currentStageId
      ? project.stages.filter((s) => s.id === options.currentStageId)
      : project.stages;

  const renderStageSvgPreview = (stage: StageData) => {
    const objList = stage.objects || stage.canvasObjects || [];
    const objMarkup = objList
      .filter((o) => o.visible !== false && !o.hidden)
      .sort((a, b) => a.zIndex - b.zIndex)
      .map((obj) => {
        const p = obj.props || {};
        if (obj.type === "text") {
          return `<text x="${obj.x + 12}" y="${obj.y + 36}" font-family="Inter, sans-serif" font-size="${p.fontSize || obj.fontSize || 28}" font-weight="${p.fontWeight || "600"}" fill="${p.color || obj.strokeColor || "#111827"}">${p.text || obj.text || obj.name}</text>`;
        }
        if (obj.type === "speech" || obj.type === "speech_bubble") {
          return `<g transform="translate(${obj.x}, ${obj.y})">
            <rect width="${obj.width}" height="${obj.height}" rx="24" fill="#ffffff" stroke="#111827" stroke-width="4"/>
            <text x="${obj.width / 2}" y="${obj.height / 2 + 6}" text-anchor="middle" font-family="Inter, sans-serif" font-size="22" font-weight="600" fill="#111827">${p.text || obj.text || "..."}</text>
          </g>`;
        }
        if (obj.type === "character") {
          const shirt = p?.rig?.shirtColor || obj.characterConfig?.topColor || "#2563EB";
          const skin = p?.rig?.skinTone || obj.characterConfig?.skinTone || "#F5CBA7";
          return `<g transform="translate(${obj.x}, ${obj.y})">
            <circle cx="${obj.width / 2}" cy="46" r="32" fill="${skin}" stroke="#111827" stroke-width="4"/>
            <rect x="${obj.width / 2 - 38}" y="82" width="76" height="110" rx="18" fill="${shirt}" stroke="#111827" stroke-width="4"/>
            <text x="${obj.width / 2}" y="${obj.height - 6}" text-anchor="middle" font-family="Inter, sans-serif" font-size="18" font-weight="700" fill="#111827">${obj.name}</text>
          </g>`;
        }
        if (obj.type === "sketch" && Array.isArray(p.points)) {
          const d = p.points
            .map((pt: { x: number; y: number }, idx: number) => `${idx === 0 ? "M" : "L"} ${pt.x} ${pt.y}`)
            .join(" ");
          return `<path d="${d}" fill="none" stroke="${p.strokeColor || "#111827"}" stroke-width="${p.strokeWidth || 4}" stroke-linecap="round" stroke-linejoin="round"/>`;
        }
        return `<rect x="${obj.x}" y="${obj.y}" width="${obj.width}" height="${obj.height}" rx="12" fill="${p.fill || obj.fillColor || "#E2E8F0"}" stroke="${p.stroke || obj.strokeColor || "#1E293B"}" stroke-width="3"/>`;
      })
      .join("\n");

    return `<svg viewBox="0 0 ${stage.width || 1920} ${stage.height || 1080}" style="width:100%;height:auto;background:${stage.bkgdColor || stage.backgroundColor || "#fffdf9"};border:1px solid #e2e8f0;border-radius:8px;display:block;">
      ${objMarkup}
    </svg>`;
  };

  let bodyHtml = "";

  if (options.includeTitlePage) {
    bodyHtml += `<div style="padding:32px;border-bottom:2px solid #e5e7eb;margin-bottom:28px;">
      <div style="font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:#6b7280;font-weight:700;">StoryTribe Production Document · ${options.layout}</div>
      <h1 style="font-size:32px;margin:8px 0;color:#111827;">${project.title}</h1>
      ${project.synopsis ? `<p style="font-size:15px;color:#4b5563;max-width:720px;line-height:1.6;">${project.synopsis}</p>` : ""}
    </div>`;
  }

  if (options.layout === "screenplay") {
    bodyHtml += `<div style="max-width:680px;margin:0 auto;font-family:'Courier New',monospace;">
      ${project.scenes
        .map(
          (scene, sIdx) => `<div style="margin-bottom:28px;">
          <h3 style="text-transform:uppercase;font-weight:700;border-bottom:1px solid #d1d5db;padding-bottom:4px;">SCENE ${sIdx + 1}: ${scene.title}</h3>
          <p style="color:#4b5563;font-size:13px;">${scene.description || ""}</p>
          ${scene.shotIds
            .map((shotId) => stages.find((st) => st.id === shotId))
            .filter(Boolean)
            .map((st) => {
              const ann = st!.annotations || st!.propertyValues || {};
              const blocks = st!.scriptBlocks || [];
              return `<div style="margin:16px 0;padding-left:12px;border-left:2px solid #9ca3af;">
              <div style="font-weight:700;font-size:13px;">SHOT ${shotNums[st!.id]} — ${st!.title} [${ann.shotsize || "MS"} / ${ann.cameraangle || "Eye Level"}]</div>
              ${blocks
                .map((b) =>
                  b.type === "character"
                    ? `<div style="text-align:center;font-weight:700;margin-top:8px;">${b.text}</div>`
                    : b.type === "dialogue"
                    ? `<div style="max-width:420px;margin:2px auto 8px auto;">${b.text}</div>`
                    : `<div style="margin:6px 0;">${b.text}</div>`
                )
                .join("")}
            </div>`;
            })
            .join("")}
        </div>`
        )
        .join("")}
    </div>`;
  } else if (options.layout === "shot-list-table") {
    bodyHtml += `<table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#f3f4f6;text-align:left;">
          <th style="padding:10px;border:1px solid #d1d5db;">#</th>
          <th style="padding:10px;border:1px solid #d1d5db;width:160px;">Frame</th>
          <th style="padding:10px;border:1px solid #d1d5db;">Title</th>
          <th style="padding:10px;border:1px solid #d1d5db;">Script</th>
          <th style="padding:10px;border:1px solid #d1d5db;">Visual Detail</th>
          <th style="padding:10px;border:1px solid #d1d5db;">Camera Angle</th>
          <th style="padding:10px;border:1px solid #d1d5db;">Shot Size</th>
          <th style="padding:10px;border:1px solid #d1d5db;">Movement</th>
        </tr>
      </thead>
      <tbody>
        ${stages
          .map((st) => {
            const ann = st.annotations || st.propertyValues || {};
            const blocks = st.scriptBlocks || [];
            return `<tr>
            <td style="padding:10px;border:1px solid #d1d5db;font-weight:700;">${shotNums[st.id]}</td>
            <td style="padding:10px;border:1px solid #d1d5db;">${renderStageSvgPreview(st)}</td>
            <td style="padding:10px;border:1px solid #d1d5db;font-weight:600;">${st.title}</td>
            <td style="padding:10px;border:1px solid #d1d5db;">${blocks.map((b) => b.text).join(" ")}</td>
            <td style="padding:10px;border:1px solid #d1d5db;">${ann.visualdetail || ""}</td>
            <td style="padding:10px;border:1px solid #d1d5db;">${ann.cameraangle || ""}</td>
            <td style="padding:10px;border:1px solid #d1d5db;">${ann.shotsize || ""}</td>
            <td style="padding:10px;border:1px solid #d1d5db;">${ann.movement || ""}</td>
          </tr>`;
          })
          .join("")}
      </tbody>
    </table>`;
  } else {
    const cols =
      options.layout === "one-per-page"
        ? 1
        : options.layout === "three-per-page"
        ? 3
        : 4;
    bodyHtml += `<div style="display:grid;grid-template-columns:repeat(${cols}, 1fr);gap:20px;">
      ${stages
        .map((st) => {
          const ann = st.annotations || st.propertyValues || {};
          const blocks = st.scriptBlocks || [];
          return `<div style="border:1px solid #e5e7eb;border-radius:12px;padding:14px;background:#ffffff;">
          ${renderStageSvgPreview(st)}
          ${
            options.layout !== "images-only"
              ? `<div style="margin-top:10px;">
              <div style="font-weight:700;font-size:14px;color:#111827;">Shot ${shotNums[st.id]} · ${st.title}</div>
              ${
                options.includeScript
                  ? `<p style="font-size:12px;color:#374151;margin:6px 0;">${blocks.map((b) => b.text).join(" ")}</p>`
                  : ""
              }
              ${
                options.includeProperties
                  ? `<div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;font-size:11px;">
                  ${ann.cameraangle ? `<span style="background:#eff6ff;color:#1d4ed8;padding:2px 8px;border-radius:99px;">${ann.cameraangle}</span>` : ""}
                  ${ann.shotsize ? `<span style="background:#f0fdf4;color:#15803d;padding:2px 8px;border-radius:99px;">${ann.shotsize}</span>` : ""}
                  ${ann.movement ? `<span style="background:#faf5ff;color:#6d28d9;padding:2px 8px;border-radius:99px;">${ann.movement}</span>` : ""}
                </div>`
                  : ""
              }
            </div>`
              : ""
          }
        </div>`;
        })
        .join("")}
    </div>`;
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${project.title} — StoryTribe Export</title>
</head>
<body style="font-family:Inter,system-ui,sans-serif;margin:24px;color:#111827;">
  ${bodyHtml}
</body>
</html>`;
}

export function generateShotListCsv(project: FullProjectData): string {
  return generateCsvExport(project);
}

export function generatePrintableStoryboardHtml(
  project: FullProjectData,
  opts: Record<string, any>
): string {
  const layoutMap: Record<string, ExportLayoutPreset> = {
    grid_storyboard: "grid-overview",
    one_per_page: "one-per-page",
    three_per_page: "three-per-page",
    images_only: "images-only",
    screenplay: "screenplay",
    shot_list_table: "shot-list-table",
  };
  return generatePrintableHtmlDocument(project, {
    layout: layoutMap[opts.layout] || "grid-overview",
    format: "PDF",
    includeTitlePage: opts.includeTitlePage ?? true,
    includeScript: true,
    includeProperties: true,
    shotRange: "all",
  });
}

export function generateProjectJson(project: FullProjectData): string {
  return JSON.stringify(project, null, 2);
}

export function downloadTextFile(
  filename: string,
  content: string,
  mimeType = "text/plain"
) {
  if (typeof window === "undefined") return;
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
