"use client";

import React from "react";
import {
  CanvasObjectData,
  CharacterRigProps,
  StageData,
} from "@/types/storytribe";
import { DEFAULT_CHARACTER_RIG } from "@/lib/catalog/storytribe-assets";

export function CharacterRigSvg({
  rig = DEFAULT_CHARACTER_RIG,
  name,
}: {
  rig?: Partial<CharacterRigProps>;
  name?: string;
}) {
  const r: CharacterRigProps = { ...DEFAULT_CHARACTER_RIG, ...rig };
  const isSide = r.viewAngle === "side";
  const isBack = r.viewAngle === "back";

  return (
    <svg
      viewBox="0 0 240 420"
      className="w-full h-full overflow-visible select-none"
    >
      {/* Drop Shadow */}
      <ellipse cx="120" cy="396" rx="58" ry="12" fill="rgba(17,24,39,0.12)" />

      {/* Legs / Pose */}
      {r.pose === "sitting" ? (
        <g stroke="#111827" strokeWidth="4.5" strokeLinecap="round">
          <path
            d="M95 250 L75 315 L75 380"
            fill="none"
            stroke={r.pantsColor}
            strokeWidth="22"
          />
          <path
            d="M145 250 L165 315 L165 380"
            fill="none"
            stroke={r.pantsColor}
            strokeWidth="22"
          />
          <rect
            x="62"
            y="375"
            width="30"
            height="14"
            rx="6"
            fill="#111827"
          />
          <rect
            x="152"
            y="375"
            width="30"
            height="14"
            rx="6"
            fill="#111827"
          />
        </g>
      ) : r.pose === "walking" || r.pose === "running" ? (
        <g>
          <line
            x1="104"
            y1="250"
            x2="78"
            y2="380"
            stroke={r.pantsColor}
            strokeWidth="24"
            strokeLinecap="round"
          />
          <line
            x1="136"
            y1="250"
            x2="164"
            y2="380"
            stroke={r.pantsColor}
            strokeWidth="24"
            strokeLinecap="round"
          />
          <rect x="60" y="376" width="34" height="14" rx="7" fill="#111827" />
          <rect x="150" y="376" width="34" height="14" rx="7" fill="#111827" />
        </g>
      ) : (
        <g>
          <rect
            x="90"
            y="245"
            width="24"
            height="135"
            rx="10"
            fill={r.pantsColor}
            stroke="#111827"
            strokeWidth="4"
          />
          <rect
            x="126"
            y="245"
            width="24"
            height="135"
            rx="10"
            fill={r.pantsColor}
            stroke="#111827"
            strokeWidth="4"
          />
          <rect x="82" y="376" width="34" height="14" rx="7" fill="#111827" />
          <rect x="124" y="376" width="34" height="14" rx="7" fill="#111827" />
        </g>
      )}

      {/* Torso / Outfit */}
      <rect
        x="76"
        y="128"
        width="88"
        height="126"
        rx="24"
        fill={r.shirtColor}
        stroke="#111827"
        strokeWidth="4"
      />
      {r.outfit === "apron" && (
        <rect
          x="88"
          y="148"
          width="64"
          height="102"
          rx="10"
          fill="#ffffff"
          stroke="#111827"
          strokeWidth="3"
        />
      )}
      {r.outfit === "business" && (
        <polygon
          points="120,132 108,175 120,210 132,175"
          fill="#EF4444"
          stroke="#111827"
          strokeWidth="2.5"
        />
      )}

      {/* Arms */}
      {r.pose === "pointing" || r.pose === "celebrating" ? (
        <g>
          <path
            d="M78 148 Q45 180 56 225"
            fill="none"
            stroke={r.shirtColor}
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M162 148 Q205 110 222 82"
            fill="none"
            stroke={r.shirtColor}
            strokeWidth="20"
            strokeLinecap="round"
          />
          <circle
            cx="224"
            cy="78"
            r="11"
            fill={r.skinTone}
            stroke="#111827"
            strokeWidth="3.5"
          />
        </g>
      ) : (
        <g>
          <path
            d="M78 146 Q52 192 68 236"
            fill="none"
            stroke={r.shirtColor}
            strokeWidth="20"
            strokeLinecap="round"
          />
          <path
            d="M162 146 Q188 192 172 236"
            fill="none"
            stroke={r.shirtColor}
            strokeWidth="20"
            strokeLinecap="round"
          />
          <circle
            cx="68"
            cy="240"
            r="10"
            fill={r.skinTone}
            stroke="#111827"
            strokeWidth="3.5"
          />
          <circle
            cx="172"
            cy="240"
            r="10"
            fill={r.skinTone}
            stroke="#111827"
            strokeWidth="3.5"
          />
        </g>
      )}

      {/* Head */}
      <circle
        cx="120"
        cy="76"
        r="40"
        fill={r.skinTone}
        stroke="#111827"
        strokeWidth="4"
      />

      {/* Hair Style */}
      {r.hairStyle === "bun" && (
        <circle
          cx="120"
          cy="24"
          r="18"
          fill={r.hairColor}
          stroke="#111827"
          strokeWidth="3.5"
        />
      )}
      <path
        d={
          r.hairStyle === "wavy" || r.hairStyle === "curly"
            ? "M78 72 C76 26, 164 26, 162 72 C152 46, 88 46, 78 72 Z"
            : "M80 66 C82 28, 158 28, 160 66 C146 48, 94 48, 80 66 Z"
        }
        fill={r.hairColor}
        stroke="#111827"
        strokeWidth="3.5"
      />

      {/* Facial Expression (hidden if back view) */}
      {!isBack && (
        <g transform={isSide ? "translate(12, 0)" : undefined}>
          {/* Eyes */}
          <circle cx="106" cy="74" r="3.8" fill="#111827" />
          {r.expression === "wink" ? (
            <path
              d="M128 74 Q134 69 140 74"
              stroke="#111827"
              strokeWidth="3"
              fill="none"
            />
          ) : (
            <circle cx="134" cy="74" r="3.8" fill="#111827" />
          )}

          {/* Eyebrows */}
          <path
            d={
              r.expression === "angry"
                ? "M98 63 L112 67 M142 63 L128 67"
                : "M98 64 Q106 60 112 64 M128 64 Q134 60 142 64"
            }
            stroke="#111827"
            strokeWidth="2.8"
            strokeLinecap="round"
            fill="none"
          />

          {/* Mouth */}
          {r.expression === "surprised" ? (
            <circle
              cx="120"
              cy="92"
              r="6"
              fill="#111827"
            />
          ) : r.expression === "sad" || r.expression === "angry" ? (
            <path
              d="M110 96 Q120 88 130 96"
              stroke="#111827"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          ) : r.expression === "neutral" || r.expression === "serious" ? (
            <line
              x1="110"
              y1="92"
              x2="130"
              y2="92"
              stroke="#111827"
              strokeWidth="3"
              strokeLinecap="round"
            />
          ) : (
            <path
              d="M108 88 Q120 100 132 88"
              stroke="#111827"
              strokeWidth="3.2"
              strokeLinecap="round"
              fill="none"
            />
          )}

          {/* Glasses accessory */}
          {r.accessory === "glasses" && (
            <g stroke="#111827" strokeWidth="2.8" fill="none">
              <circle cx="106" cy="74" r="10" />
              <circle cx="134" cy="74" r="10" />
              <line x1="116" y1="74" x2="124" y2="74" />
            </g>
          )}
        </g>
      )}

      {/* Hand Accessories */}
      {r.accessory === "coffee" && (
        <g transform="translate(158, 212)">
          <rect
            x="0"
            y="0"
            width="24"
            height="30"
            rx="4"
            fill="#F97316"
            stroke="#111827"
            strokeWidth="3"
          />
          <rect x="-2" y="-4" width="28" height="6" rx="2" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
        </g>
      )}

      {name && (
        <text
          x="120"
          y="414"
          textAnchor="middle"
          fontSize="14"
          fontWeight="700"
          fill="#374151"
        >
          {name}
        </text>
      )}
    </svg>
  );
}

export function SceneBackdropSvg({ presetKey }: { presetKey?: string }) {
  if (presetKey === "city-street") {
    return (
      <svg viewBox="0 0 1600 900" className="w-full h-full" preserveAspectRatio="none">
        <rect width="1600" height="900" fill="#EFF6FF" />
        <rect x="0" y="640" width="1600" height="260" fill="#E2E8F0" stroke="#1E293B" strokeWidth="4" />
        <rect x="120" y="140" width="380" height="500" fill="#DBEAFE" stroke="#1E293B" strokeWidth="4" />
        <rect x="540" y="220" width="460" height="420" fill="#FEF3C7" stroke="#1E293B" strokeWidth="4" />
        <rect x="590" y="420" width="360" height="220" fill="#BFDBFE" stroke="#1E293B" strokeWidth="4" />
        <rect x="1060" y="100" width="400" height="540" fill="#F1F5F9" stroke="#1E293B" strokeWidth="4" />
      </svg>
    );
  }
  if (presetKey === "modern-office") {
    return (
      <svg viewBox="0 0 1600 900" className="w-full h-full" preserveAspectRatio="none">
        <rect width="1600" height="900" fill="#F8FAFC" />
        <line x1="0" y1="680" x2="1600" y2="680" stroke="#1E293B" strokeWidth="4" />
        <rect x="180" y="140" width="540" height="320" rx="8" fill="#E0F2FE" stroke="#1E293B" strokeWidth="4" />
        <rect x="860" y="160" width="480" height="280" rx="8" fill="#ffffff" stroke="#1E293B" strokeWidth="4" />
        <rect x="420" y="540" width="760" height="140" rx="8" fill="#E2E8F0" stroke="#1E293B" strokeWidth="4" />
      </svg>
    );
  }
  // Default: Coffee shop interior
  return (
    <svg viewBox="0 0 1600 900" className="w-full h-full" preserveAspectRatio="none">
      <rect width="1600" height="900" fill="#FFFBEB" />
      <rect x="0" y="650" width="1600" height="250" fill="#FDE68A" opacity="0.45" />
      <line x1="0" y1="650" x2="1600" y2="650" stroke="#111827" strokeWidth="4" />
      {/* Cafe Window */}
      <rect x="140" y="140" width="480" height="360" rx="12" fill="#E0F2FE" stroke="#111827" strokeWidth="4" />
      {/* Menu Board */}
      <rect x="760" y="130" width="420" height="220" rx="10" fill="#1F2937" stroke="#111827" strokeWidth="4" />
      <line x1="800" y1="180" x2="1080" y2="180" stroke="#F9FAFB" strokeWidth="6" strokeLinecap="round" />
      <line x1="800" y1="220" x2="1020" y2="220" stroke="#F9FAFB" strokeWidth="4" strokeLinecap="round" />
      {/* Counter */}
      <rect x="680" y="490" width="720" height="220" rx="8" fill="#D97706" stroke="#111827" strokeWidth="4" />
    </svg>
  );
}

export function CanvasObjectSvg({
  object: objProp,
  item,
}: {
  object?: CanvasObjectData;
  item?: CanvasObjectData;
}) {
  const object = (objProp || item)!;
  if (!object || object.visible === false || object.hidden) return null;

  if (object.type === "scene" || object.type === "backdrop") {
    return (
      <SceneBackdropSvg
        presetKey={object.props?.presetKey || object.assetId}
      />
    );
  }

  if (object.type === "character") {
    const rawCfg = object.props?.rig || object.characterConfig || {};
    const rig = {
      ...rawCfg,
      shirtColor: rawCfg.shirtColor || rawCfg.topColor || "#2563EB",
      pantsColor: rawCfg.pantsColor || rawCfg.bottomColor || "#1E293B",
    };
    return (
      <div
        className="w-full h-full"
        style={{
          transform: `${object.flipX ? "scaleX(-1)" : ""} ${object.flipY ? "scaleY(-1)" : ""}`,
        }}
      >
        <CharacterRigSvg rig={rig} name={object.name} />
      </div>
    );
  }

  if (object.type === "speech" || object.type === "speech_bubble") {
    const isThought =
      object.props?.bubbleType === "thought" || object.bubbleStyle === "thought";
    const isRect = object.props?.bubbleType === "speech-rect";
    const textContent =
      object.props?.text || object.text || object.name || "Dialogue...";
    return (
      <svg viewBox="0 0 320 140" className="w-full h-full overflow-visible">
        <rect
          x="8"
          y="8"
          width="304"
          height="104"
          rx={isRect ? 12 : 48}
          fill={object.props?.fill || object.fillColor || "#ffffff"}
          stroke={object.props?.stroke || object.strokeColor || "#111827"}
          strokeWidth="4"
          strokeDasharray={isThought ? "8 6" : undefined}
        />
        {isThought ? (
          <>
            <circle cx="72" cy="122" r="7" fill="#ffffff" stroke="#111827" strokeWidth="3" />
            <circle cx="56" cy="134" r="4" fill="#ffffff" stroke="#111827" strokeWidth="2.5" />
          </>
        ) : (
          <polygon
            points="70,110 98,110 62,136"
            fill={object.props?.fill || object.fillColor || "#ffffff"}
            stroke={object.props?.stroke || object.strokeColor || "#111827"}
            strokeWidth="4"
          />
        )}
        <text
          x="160"
          y="66"
          textAnchor="middle"
          fontSize="18"
          fontWeight="700"
          fill="#111827"
        >
          {textContent.slice(0, 38)}
        </text>
      </svg>
    );
  }

  if (object.type === "text") {
    return (
      <div
        className="w-full h-full flex items-center px-2 select-none"
        style={{
          fontSize: `${object.props?.fontSize || object.fontSize || 28}px`,
          fontWeight: object.props?.fontWeight || 700,
          color: object.props?.color || object.strokeColor || "#111827",
        }}
      >
        {object.props?.text || object.text || object.name}
      </div>
    );
  }

  if (object.type === "path" && object.pathData) {
    return (
      <svg viewBox="0 0 1920 1080" className="w-full h-full overflow-visible">
        <path
          d={object.pathData}
          fill="none"
          stroke={object.strokeColor || "#18181B"}
          strokeWidth={object.strokeWidth || 4}
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (object.type === "shape") {
    const shapeKind = object.props?.shapeKind || "rect";
    const fill = object.props?.fill || "#DBEAFE";
    const stroke = object.props?.stroke || "#111827";
    if (shapeKind === "circle") {
      return (
        <svg viewBox="0 0 200 200" className="w-full h-full">
          <ellipse
            cx="100"
            cy="100"
            rx="92"
            ry="92"
            fill={fill}
            stroke={stroke}
            strokeWidth="5"
          />
        </svg>
      );
    }
    if (shapeKind === "arrow" || shapeKind === "line") {
      return (
        <svg viewBox="0 0 260 80" className="w-full h-full">
          <line
            x1="14"
            y1="40"
            x2="226"
            y2="40"
            stroke={stroke}
            strokeWidth="8"
            strokeLinecap="round"
          />
          {shapeKind === "arrow" && (
            <polygon points="218,18 252,40 218,62" fill={stroke} />
          )}
        </svg>
      );
    }
    return (
      <svg viewBox="0 0 200 140" className="w-full h-full">
        <rect
          x="6"
          y="6"
          width="188"
          height="128"
          rx="12"
          fill={fill}
          stroke={stroke}
          strokeWidth="5"
        />
      </svg>
    );
  }

  if (object.type === "frame") {
    return (
      <svg viewBox="0 0 400 225" className="w-full h-full">
        <rect
          x="4"
          y="4"
          width="392"
          height="217"
          fill="none"
          stroke="#2563EB"
          strokeWidth="3"
          strokeDasharray="10 6"
        />
        <line x1="133" y1="4" x2="133" y2="221" stroke="#93C5FD" strokeWidth="1.5" />
        <line x1="266" y1="4" x2="266" y2="221" stroke="#93C5FD" strokeWidth="1.5" />
        <line x1="4" y1="75" x2="396" y2="75" stroke="#93C5FD" strokeWidth="1.5" />
        <line x1="4" y1="150" x2="396" y2="150" stroke="#93C5FD" strokeWidth="1.5" />
      </svg>
    );
  }

  if (object.type === "image" && object.props?.src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={object.props.src}
        alt={object.name}
        className="w-full h-full object-contain pointer-events-none"
      />
    );
  }

  // Prop object rendering
  return (
    <svg viewBox="0 0 220 180" className="w-full h-full">
      <rect
        x="16"
        y="24"
        width="188"
        height="132"
        rx="18"
        fill={object.props?.fill || "#FEF3C7"}
        stroke="#111827"
        strokeWidth="4.5"
      />
      <text
        x="110"
        y="96"
        textAnchor="middle"
        fontSize="16"
        fontWeight="800"
        fill="#111827"
      >
        {object.name}
      </text>
    </svg>
  );
}

export function StageMiniPreview({
  stage,
  width,
  height,
  backgroundColor,
  objects,
  className = "",
}: {
  stage?: StageData;
  width?: number;
  height?: number;
  backgroundColor?: string;
  objects?: CanvasObjectData[];
  className?: string;
}) {
  const stageW = stage?.width || width || 1920;
  const stageH = stage?.height || height || 1080;
  const bg =
    stage?.bkgdColor ||
    stage?.backgroundColor ||
    backgroundColor ||
    "#fffdf9";
  const rawObjects =
    objects || stage?.canvasObjects || stage?.objects || [];
  const sortedObjects = [...rawObjects]
    .filter((o) => o.visible !== false && !o.hidden)
    .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div
      className={`relative overflow-hidden border border-gray-200 rounded-lg ${className}`}
      style={{
        aspectRatio: `${stageW} / ${stageH}`,
        backgroundColor: bg,
      }}
    >
      {sortedObjects.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 text-xs p-3 text-center">
          <span>{stage?.title || "Storyboard Frame"}</span>
        </div>
      ) : (
        sortedObjects.map((obj) => {
          if (obj.type === "sketch" && Array.isArray(obj.props?.points)) {
            const d = obj.props.points
              .map(
                (pt: { x: number; y: number }, i: number) =>
                  `${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`
              )
              .join(" ");
            return (
              <svg
                key={obj.id}
                viewBox={`0 0 ${stageW} ${stageH}`}
                className="absolute inset-0 w-full h-full pointer-events-none"
              >
                <path
                  d={d}
                  fill="none"
                  stroke={obj.props?.strokeColor || "#111827"}
                  strokeWidth={obj.props?.strokeWidth || 6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            );
          }

          const leftPct = ((obj.x || 0) / stageW) * 100;
          const topPct = ((obj.y || 0) / stageH) * 100;
          const widthPct = ((obj.width || 200) / stageW) * 100;
          const heightPct = ((obj.height || 200) / stageH) * 100;

          return (
            <div
              key={obj.id}
              className="absolute pointer-events-none"
              style={{
                left: `${leftPct}%`,
                top: `${topPct}%`,
                width: `${widthPct}%`,
                height: `${heightPct}%`,
                opacity: obj.opacity ?? 1,
                transform: obj.rotation ? `rotate(${obj.rotation}deg)` : undefined,
              }}
            >
              <CanvasObjectSvg object={obj} />
            </div>
          );
        })
      )}
    </div>
  );
}
