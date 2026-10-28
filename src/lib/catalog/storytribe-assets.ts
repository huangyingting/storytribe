import { CharacterRigProps } from "@/types/storytribe";

export const DEFAULT_CHARACTER_RIG: CharacterRigProps = {
  pose: "standing",
  expression: "happy",
  outfit: "casual",
  hairStyle: "short",
  skinTone: "#F5CBA7",
  hairColor: "#1F2937",
  shirtColor: "#2563EB",
  pantsColor: "#1E293B",
  viewAngle: "front",
  accessory: "none",
};

export const CHARACTER_PRESETS: Array<{
  id: string;
  name: string;
  role: string;
  rig: CharacterRigProps;
}> = [
  {
    id: "char-maya",
    name: "Maya (Barista / Creator)",
    role: "Lead Protagonist",
    rig: {
      pose: "talking",
      expression: "happy",
      outfit: "apron",
      hairStyle: "bun",
      skinTone: "#E5B887",
      hairColor: "#1C1917",
      shirtColor: "#F97316",
      pantsColor: "#1E293B",
      viewAngle: "front",
      accessory: "coffee",
    },
  },
  {
    id: "char-alex",
    name: "Alex (Director)",
    role: "Film Director",
    rig: {
      pose: "pointing",
      expression: "serious",
      outfit: "director",
      hairStyle: "wavy",
      skinTone: "#F5CBA7",
      hairColor: "#451A03",
      shirtColor: "#111827",
      pantsColor: "#334155",
      viewAngle: "three-quarter",
      accessory: "clipboard",
    },
  },
  {
    id: "char-liam",
    name: "Liam (Commuter)",
    role: "Customer / Urban",
    rig: {
      pose: "walking",
      expression: "neutral",
      outfit: "hoodie",
      hairStyle: "short",
      skinTone: "#FDEBD0",
      hairColor: "#78350F",
      shirtColor: "#7C3AED",
      pantsColor: "#0F172A",
      viewAngle: "side",
      accessory: "headphones",
    },
  },
  {
    id: "char-zoe",
    name: "Zoe (Executive)",
    role: "Producer / Client",
    rig: {
      pose: "standing",
      expression: "thinking",
      outfit: "business",
      hairStyle: "bob",
      skinTone: "#8D5524",
      hairColor: "#09090B",
      shirtColor: "#10B981",
      pantsColor: "#18181B",
      viewAngle: "front",
      accessory: "glasses",
    },
  },
  {
    id: "char-kai",
    name: "Kai (Cinematographer)",
    role: "Camera Operator",
    rig: {
      pose: "standing",
      expression: "surprised",
      outfit: "coat",
      hairStyle: "beanie",
      skinTone: "#C68642",
      hairColor: "#1E293B",
      shirtColor: "#0284C7",
      pantsColor: "#1E293B",
      viewAngle: "three-quarter",
      accessory: "camera",
    },
  },
  {
    id: "char-elena",
    name: "Elena (Designer)",
    role: "UX Researcher",
    rig: {
      pose: "sitting",
      expression: "wink",
      outfit: "casual",
      hairStyle: "ponytail",
      skinTone: "#F1C27D",
      hairColor: "#991B1B",
      shirtColor: "#EC4899",
      pantsColor: "#312E81",
      viewAngle: "front",
      accessory: "glasses",
    },
  },
];

export interface StoryAssetCatalogItem {
  id: string;
  name: string;
  category: "Scenes" | "Props" | "Icons" | "Themes";
  type: "scene" | "prop";
  defaultWidth: number;
  defaultHeight: number;
  tags: string[];
  presetKey: string;
}

export const STORY_ASSET_CATALOG: StoryAssetCatalogItem[] = [
  // Scenes / Backgrounds
  {
    id: "scene-coffee-shop",
    name: "Coffee Shop Interior",
    category: "Scenes",
    type: "scene",
    defaultWidth: 1600,
    defaultHeight: 900,
    tags: ["cafe", "coffee", "interior", "counter", "warm"],
    presetKey: "coffee-shop",
  },
  {
    id: "scene-city-street",
    name: "City Sidewalk & Storefront",
    category: "Scenes",
    type: "scene",
    defaultWidth: 1600,
    defaultHeight: 900,
    tags: ["exterior", "street", "city", "buildings", "urban"],
    presetKey: "city-street",
  },
  {
    id: "scene-modern-office",
    name: "Creative Studio & Boardroom",
    category: "Scenes",
    type: "scene",
    defaultWidth: 1600,
    defaultHeight: 900,
    tags: ["office", "desk", "meeting", "interior", "workspace"],
    presetKey: "modern-office",
  },
  {
    id: "scene-living-room",
    name: "Cozy Apartment Living Room",
    category: "Scenes",
    type: "scene",
    defaultWidth: 1600,
    defaultHeight: 900,
    tags: ["home", "sofa", "window", "interior", "living"],
    presetKey: "living-room",
  },
  {
    id: "scene-film-set",
    name: "Soundstage & Lighting Rig",
    category: "Scenes",
    type: "scene",
    defaultWidth: 1600,
    defaultHeight: 900,
    tags: ["production", "film", "studio", "lights"],
    presetKey: "film-set",
  },
  // Props
  {
    id: "prop-espresso-machine",
    name: "Commercial Espresso Machine",
    category: "Props",
    type: "prop",
    defaultWidth: 280,
    defaultHeight: 240,
    tags: ["coffee", "cafe", "machine", "barista"],
    presetKey: "espresso-machine",
  },
  {
    id: "prop-latte-cup",
    name: "Ceramic Latte Art Cup",
    category: "Props",
    type: "prop",
    defaultWidth: 160,
    defaultHeight: 140,
    tags: ["cup", "coffee", "mug", "drink"],
    presetKey: "latte-cup",
  },
  {
    id: "prop-cafe-table",
    name: "Bistro Wooden Table & Chairs",
    category: "Props",
    type: "prop",
    defaultWidth: 360,
    defaultHeight: 240,
    tags: ["table", "chair", "furniture", "cafe"],
    presetKey: "cafe-table",
  },
  {
    id: "prop-laptop-desk",
    name: "Workstation Laptop & Notebook",
    category: "Props",
    type: "prop",
    defaultWidth: 220,
    defaultHeight: 160,
    tags: ["laptop", "computer", "tech", "work"],
    presetKey: "laptop-desk",
  },
  {
    id: "prop-cinema-camera",
    name: "Cinema Camera on Tripod",
    category: "Props",
    type: "prop",
    defaultWidth: 240,
    defaultHeight: 300,
    tags: ["camera", "tripod", "film", "lens"],
    presetKey: "cinema-camera",
  },
  {
    id: "prop-clapperboard",
    name: "Director Slate / Clapperboard",
    category: "Props",
    type: "prop",
    defaultWidth: 180,
    defaultHeight: 160,
    tags: ["slate", "action", "director", "cinema"],
    presetKey: "clapperboard",
  },
  {
    id: "prop-potted-plant",
    name: "Monstera Studio Plant",
    category: "Props",
    type: "prop",
    defaultWidth: 180,
    defaultHeight: 260,
    tags: ["plant", "decor", "interior", "leaf"],
    presetKey: "potted-plant",
  },
  // Icons / Camera Direction Markers
  {
    id: "icon-camera-pan",
    name: "Camera Pan / Dolly Arrow",
    category: "Icons",
    type: "prop",
    defaultWidth: 240,
    defaultHeight: 100,
    tags: ["arrow", "movement", "camera", "pan"],
    presetKey: "camera-pan",
  },
  {
    id: "icon-zoom-frame",
    name: "Push-In / Zoom Frame Guide",
    category: "Icons",
    type: "prop",
    defaultWidth: 320,
    defaultHeight: 200,
    tags: ["zoom", "push", "frame", "camera"],
    presetKey: "zoom-frame",
  },
  // Themes
  {
    id: "theme-noir-spotlight",
    name: "Dramatic Noir Spotlight",
    category: "Themes",
    type: "scene",
    defaultWidth: 1600,
    defaultHeight: 900,
    tags: ["noir", "dramatic", "contrast", "lighting"],
    presetKey: "noir-spotlight",
  },
  {
    id: "theme-golden-hour",
    name: "Golden Hour Sunbeams",
    category: "Themes",
    type: "scene",
    defaultWidth: 1600,
    defaultHeight: 900,
    tags: ["sun", "warm", "morning", "atmosphere"],
    presetKey: "golden-hour",
  },
];

export const COVER_PALETTES: Array<{
  id: string;
  name: string;
  cssBackground: string;
}> = [
  {
    id: "aura-warm",
    name: "Warm Aura",
    cssBackground:
      "linear-gradient(135deg, #FDE68A 0%, #FCA5A5 50%, #C4B5FD 100%)",
  },
  {
    id: "aura-ocean",
    name: "Ocean Breeze",
    cssBackground:
      "linear-gradient(135deg, #A7F3D0 0%, #93C5FD 50%, #C7D2FE 100%)",
  },
  {
    id: "aura-sunset",
    name: "Cinema Sunset",
    cssBackground:
      "linear-gradient(135deg, #FDBA74 0%, #F472B6 50%, #818CF8 100%)",
  },
  {
    id: "solid-obsidian",
    name: "Studio Obsidian",
    cssBackground: "linear-gradient(135deg, #18181B 0%, #27272A 100%)",
  },
  {
    id: "solid-cream",
    name: "Editorial Cream",
    cssBackground: "linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)",
  },
  {
    id: "solid-emerald",
    name: "Forest Slate",
    cssBackground: "linear-gradient(135deg, #065F46 0%, #047857 100%)",
  },
];

export const ASPECT_RATIOS = [
  { id: "16:9", label: "16:9 Widescreen", desc: "Film, YouTube & TV", width: 1920, height: 1080 },
  { id: "9:16", label: "9:16 Vertical", desc: "Reels, TikTok & Shorts", width: 1080, height: 1920 },
  { id: "4:3", label: "4:3 Classic", desc: "Classic TV & Presentations", width: 1440, height: 1080 },
  { id: "1:1", label: "1:1 Square", desc: "Social Carousels & Posts", width: 1080, height: 1080 },
  { id: "2.35:1", label: "2.35:1 Anamorphic", desc: "Widescreen Cinema Scope", width: 1920, height: 817 },
];

export const AUDIO_MUSIC_PRESETS = [
  {
    id: "cinematic-pulse",
    name: "Cinematic Warm Pulse",
    bpm: 96,
    duration: 15,
    mood: "Inspiring / Commercial",
  },
  {
    id: "upbeat-acoustic",
    name: "Morning Cafe Acoustic",
    bpm: 112,
    duration: 15,
    mood: "Warm / Friendly",
  },
  {
    id: "ambient-lofi",
    name: "Storyteller Lo-Fi Beat",
    bpm: 84,
    duration: 15,
    mood: "Relaxed / Modern",
  },
  {
    id: "suspense-drone",
    name: "Noir Tension Underscore",
    bpm: 72,
    duration: 15,
    mood: "Dramatic / Thriller",
  },
];

export const VISUAL_STYLES = [
  { id: "color-shaded", name: "Color Shaded", desc: "Signature StoryTribe illustrated look" },
  { id: "storyboard-sketch", name: "Storyboard Sketch", desc: "Classic black & white hand-drawn ink" },
  { id: "cinematic-realism", name: "Cinematic Realism", desc: "High-contrast theatrical film lighting" },
  { id: "flat-vector", name: "Clean Editorial Vector", desc: "Bold agency presentation illustration" },
  { id: "anime-cel", name: "Anime Cel Shaded", desc: "Expressive Japanese animation framing" },
  { id: "watercolor", name: "Soft Watercolor", desc: "Painterly children's book & indie tone" },
  { id: "noir-comic", name: "Noir Graphic Novel", desc: "Deep shadows and dramatic ink contrast" },
  { id: "3d-previz", name: "3D Pre-Vis Render", desc: "Studio camera blocking & depth pass" },
];

export const CHARACTER_POSES = [
  { id: "standing", label: "Standing Neutral" },
  { id: "waving", label: "Waving Greeting" },
  { id: "talking", label: "Talking / Gesturing" },
  { id: "pointing", label: "Pointing Direction" },
  { id: "walking", label: "Walking In Stride" },
  { id: "sitting", label: "Sitting at Desk/Cafe" },
  { id: "thinking", label: "Thinking Chin-Rest" },
  { id: "celebrating", label: "Celebrating Arms Up" },
];

export const CHARACTER_EXPRESSIONS = [
  { id: "happy", label: "Happy / Warm Smile" },
  { id: "neutral", label: "Neutral / Calm" },
  { id: "surprised", label: "Surprised / Wide-Eyed" },
  { id: "serious", label: "Serious / Focused" },
  { id: "sad", label: "Sad / Concerned" },
  { id: "angry", label: "Angry / Intense" },
  { id: "wink", label: "Playful Wink" },
  { id: "thinking", label: "Curious / Thinking" },
];

export const CHARACTER_HAIR_STYLES = [
  { id: "short", label: "Short Crop" },
  { id: "wavy", label: "Medium Wavy" },
  { id: "bun", label: "Top Bun" },
  { id: "curly", label: "Curly Afro" },
  { id: "ponytail", label: "Ponytail" },
  { id: "bob", label: "Classic Bob" },
  { id: "beanie", label: "Studio Beanie" },
];

export const CHARACTER_OUTFITS = [
  { id: "casual", label: "Casual Crewneck" },
  { id: "business", label: "Business Suit & Tie" },
  { id: "hoodie", label: "Tech Hoodie" },
  { id: "apron", label: "Barista / Artist Apron" },
  { id: "director", label: "Director Vest" },
  { id: "coat", label: "Trench Coat" },
];

export const SCENE_BACKDROPS = [
  { id: "coffee-shop", label: "Coffee Shop Interior" },
  { id: "city-street", label: "City Sidewalk & Storefront" },
  { id: "modern-office", label: "Creative Studio & Boardroom" },
  { id: "living-room", label: "Cozy Apartment Living Room" },
];

export const PROP_AND_SCENE_ASSETS = [
  { id: "prop-espresso", name: "Espresso Machine", color: "#FDE68A" },
  { id: "prop-latte", name: "Latte Art Cup", color: "#FED7AA" },
  { id: "prop-table", name: "Cafe Bistro Table", color: "#E2E8F0" },
  { id: "prop-laptop", name: "Studio Laptop", color: "#DBEAFE" },
  { id: "prop-camera", name: "Cinema Camera Rig", color: "#E0E7FF" },
  { id: "prop-slate", name: "Clapperboard Slate", color: "#F3E8FF" },
];

export const EXPORT_LAYOUTS = [
  {
    id: "grid_storyboard",
    label: "Storyboard Grid (3×2)",
    desc: "Classic multi-column production storyboard sheet with shot properties.",
  },
  {
    id: "one_per_page",
    label: "1 Shot Per Page (Presentation)",
    desc: "Full-bleed widescreen presentation frame with detailed notes.",
  },
  {
    id: "three_per_page",
    label: "3 Shots Per Page (Vertical)",
    desc: "Left-column frames paired with right-column script & camera specs.",
  },
  {
    id: "images_only",
    label: "Clean Frames Only",
    desc: "High-resolution illustrated frames without metadata captions.",
  },
  {
    id: "screenplay",
    label: "Screenplay Manuscript",
    desc: "Industry-standard screenplay layout with scene headings and dialogue.",
  },
  {
    id: "shot_list_table",
    label: "Shot List Spreadsheet (CSV)",
    desc: "Complete tabular shot breakdown for assistant directors & DPs.",
  },
];

