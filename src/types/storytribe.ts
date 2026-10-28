export type EditorViewMode =
  | "bible"
  | "writer"
  | "grid"
  | "story_bible"
  | "script"
  | "storyboard"
  | "canvas"
  | "table"
  | "video";

export type EditorToolMenu =
  | "select"
  | "tribe-ai"
  | "saved-items"
  | "search"
  | "add-characters"
  | "ai"
  | "elements"
  | "character"
  | "sketch"
  | "comment"
  | "create";

export type EditorMenuTab = EditorToolMenu;

export type RightPanelTab =
  | "script"
  | "canvas"
  | "layers"
  | "comments"
  | "shot_info"
  | "properties";

export type EditorRightPanelTab = RightPanelTab;

export type ExportLayoutType =
  | "one-per-page"
  | "three-per-page"
  | "grid-overview"
  | "images-only"
  | "screenplay"
  | "shot-list-table"
  | "grid_storyboard"
  | "shot_list_table"
  | "one_per_page"
  | "three_per_page"
  | "images_only";

export type ScriptBlockType =
  | "action"
  | "character"
  | "dialogue"
  | "parenthetical"
  | "transition";

export interface ScriptBlock {
  id: string;
  type: ScriptBlockType;
  text: string;
}

export interface SceneData {
  id: string;
  title: string;
  description: string;
  shotIds: string[];
  sceneNumber?: number;
}

export interface CharacterRigProps {
  pose:
    | "standing"
    | "walking"
    | "talking"
    | "pointing"
    | "sitting"
    | "thinking"
    | "running"
    | "celebrating";
  expression:
    | "neutral"
    | "happy"
    | "surprised"
    | "serious"
    | "sad"
    | "angry"
    | "wink"
    | "thinking";
  outfit:
    | "casual"
    | "business"
    | "hoodie"
    | "apron"
    | "director"
    | "coat"
    | "sporty"
    | "Evening";
  hairStyle:
    | "short"
    | "wavy"
    | "bun"
    | "curly"
    | "ponytail"
    | "buzz"
    | "bob"
    | "beanie";
  skinTone: string;
  hairColor: string;
  shirtColor: string;
  pantsColor: string;
  viewAngle: "front" | "three-quarter" | "side" | "back";
  accessory?: "none" | "glasses" | "headphones" | "coffee" | "clipboard" | "camera";
}

export type CanvasObjectType =
  | "character"
  | "prop"
  | "scene"
  | "backdrop"
  | "shape"
  | "text"
  | "speech"
  | "speech_bubble"
  | "sketch"
  | "path"
  | "frame"
  | "image";

export interface CanvasObjectData {
  id: string;
  type: CanvasObjectType;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipX?: boolean;
  flipY?: boolean;
  opacity: number;
  locked?: boolean;
  visible?: boolean;
  hidden?: boolean;
  zIndex: number;
  props?: Record<string, any>;
  assetId?: string;
  text?: string;
  fontSize?: number;
  bubbleStyle?: "speech" | "thought";
  shapeType?: "rect" | "circle" | "arrow" | "line";
  fillColor?: string;
  strokeColor?: string;
  strokeWidth?: number;
  pathData?: string;
  characterConfig?: Record<string, any>;
}

export type CanvasObjectItem = CanvasObjectData;

export interface StageData {
  id: string;
  projectId?: string;
  title: string;
  sortOrder?: number;
  orderIndex?: number;
  sceneNumber?: number;
  shotNumber?: number;
  durationSec?: number;
  synopsis?: string;
  scriptContent?: string;
  bkgdColor?: string;
  backgroundColor?: string;
  width?: number;
  height?: number;
  annotations?: Record<string, string>;
  propertyValues?: Record<string, any>;
  scriptBlocks?: ScriptBlock[];
  objects?: CanvasObjectData[];
  canvasObjects: CanvasObjectData[];
  groups?: Record<string, string[]>;
  thumbnailData?: string | null;
  thumbnailSvg?: string | null;
}

export interface VideoFrameItem {
  id?: string;
  frameId?: string;
  stageId?: string;
  duration?: number;
  durationSec: number;
  transition: "none" | "fade" | "dissolve" | "wipe" | "NONE" | "CROSSFADE" | "FADE_BLACK" | "WIPE_LEFT";
  transitionDur?: number;
}

export interface VoiceTrackItem {
  id: string;
  name: string;
  startTime?: number;
  startTimeSec?: number;
  duration?: number;
  durationSec?: number;
  volume: number;
  script?: string;
  scriptText?: string;
  voiceId: string;
  audioDataUrl?: string;
}

export interface AudioTrackItem {
  id: string;
  name: string;
  startTime?: number;
  startTimeSec?: number;
  duration?: number;
  durationSec?: number;
  volume: number;
  loop?: boolean;
  laneIndex?: number;
  presetId?: string;
}

export interface VideoClipItem {
  id: string;
  name: string;
  startTime: number;
  duration: number;
  stageId?: string;
  style: string;
}

export interface VideoProjectData {
  id: string;
  projectId?: string;
  isInitialized?: boolean;
  fps?: number;
  aspectRatio?: string;
  frames: VideoFrameItem[];
  settings?: {
    defaultDuration: number;
    transition: "none" | "fade" | "dissolve" | "wipe";
    resolution: "720p" | "1080p";
    fps: number;
    musicVolume: number;
  };
  voiceTracks?: VoiceTrackItem[];
  voiceoverTracks: VoiceTrackItem[];
  audioTracks?: AudioTrackItem[];
  musicTracks: AudioTrackItem[];
  videoClips?: VideoClipItem[];
  shareToken?: string;
  isPublic?: boolean;
}

export interface ProjectElementData {
  id: string;
  name: string;
  handle: string;
  category: "CHARACTER" | "PROP" | "BACKGROUND";
  description: string;
  svgData: string;
  projectId?: string | null;
  workspaceId?: string | null;
}

export interface PropertyDefinitionData {
  id: string;
  key: string;
  label: string;
  type:
    | "text"
    | "select"
    | "multiselect"
    | "number"
    | "checkbox"
    | "person"
    | "media";
  category: string;
  options: string[];
  isDefault: boolean;
}

export interface CommentData {
  id: string;
  projectId: string;
  stageId?: string | null;
  authorId?: string | null;
  authorName: string;
  content: string;
  x?: number | null;
  y?: number | null;
  pinX?: number | null;
  pinY?: number | null;
  resolved: boolean;
  parentId?: string | null;
  createdAt: string;
}

export interface FullProjectData {
  id: string;
  title: string;
  synopsis: string;
  scriptContent?: string;
  visualStyle?: string;
  aspectRatio?: string;
  coverImage?: string | null;
  coverPalette: string;
  ownerId: string;
  workspaceId?: string | null;
  width: number;
  height: number;
  annotationFields: string[];
  scenes: SceneData[];
  stageOrder: string[];
  stages: StageData[];
  elements: ProjectElementData[];
  comments: CommentData[];
  videoProject: VideoProjectData | null;
  shareToken: string;
  isPublic: boolean;
  shareAccess: "off" | "view" | "comment";
  isPublishedToCommunity: boolean;
  likesCount: number;
  updatedAt: string;
}
