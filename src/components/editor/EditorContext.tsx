"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import type {
  CanvasObjectItem,
  EditorMenuTab,
  EditorRightPanelTab,
  EditorViewMode,
  FullProjectData,
  StageData,
} from "@/types/storytribe";

interface EditorContextValue {
  project: FullProjectData;
  viewMode: EditorViewMode;
  setViewMode: (mode: EditorViewMode) => void;
  activeStageId: string;
  setActiveStageId: (id: string) => void;
  activeStage: StageData;
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  selectedObject: CanvasObjectItem | null;
  activeMenu: EditorMenuTab;
  setActiveMenu: (menu: EditorMenuTab) => void;
  rightPanelTab: EditorRightPanelTab;
  setRightPanelTab: (tab: EditorRightPanelTab) => void;
  zoom: number;
  setZoom: (z: number) => void;
  saving: boolean;
  lastSavedAt: string | null;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  updateProjectMeta: (patch: Partial<FullProjectData>) => void;
  addStage: (partial?: Partial<StageData>) => void;
  duplicateStage: (stageId: string) => void;
  deleteStage: (stageId: string) => void;
  updateStage: (stageId: string, patch: Partial<StageData>) => void;
  updateStageProperty: (stageId: string, propKey: string, value: any) => void;
  addCanvasObject: (obj: Omit<CanvasObjectItem, "id" | "zIndex">) => void;
  updateCanvasObject: (objId: string, patch: Partial<CanvasObjectItem>) => void;
  deleteCanvasObject: (objId: string) => void;
  reorderCanvasObject: (objId: string, direction: "up" | "down") => void;
  saveToCloud: (overrideProject?: FullProjectData) => Promise<void>;
  refreshComments: () => Promise<void>;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function EditorProvider({
  initialProject,
  children,
}: {
  initialProject: FullProjectData;
  children: React.ReactNode;
}) {
  const [project, setProject] = useState<FullProjectData>(initialProject);
  const [past, setPast] = useState<FullProjectData[]>([]);
  const [future, setFuture] = useState<FullProjectData[]>([]);

  const [viewMode, setViewMode] = useState<EditorViewMode>("storyboard");
  const [activeStageId, setActiveStageId] = useState<string>(
    initialProject.stages[0]?.id || ""
  );
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  const [activeMenu, setActiveMenu] = useState<EditorMenuTab>("select");
  const [rightPanelTab, setRightPanelTab] =
    useState<EditorRightPanelTab>("shot_info");
  const [zoom, setZoom] = useState<number>(0.42);
  const [saving, setSaving] = useState<boolean>(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);

  const commitChange = useCallback(
    (updater: (prev: FullProjectData) => FullProjectData) => {
      setProject((prev) => {
        const next = updater(prev);
        setPast((p) => [...p.slice(-49), prev]);
        setFuture([]);
        return next;
      });
    },
    []
  );

  const undo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      setFuture((f) => [project, ...f.slice(0, 49)]);
      setProject(previous);
      return prevPast.slice(0, -1);
    });
  }, [project]);

  const redo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      setPast((p) => [...p.slice(-49), project]);
      setProject(next);
      return prevFuture.slice(1);
    });
  }, [project]);

  const activeStage =
    project.stages.find((s) => s.id === activeStageId) || project.stages[0];

  const selectedObject =
    activeStage?.canvasObjects.find((o) => o.id === selectedObjectId) || null;

  const updateProjectMeta = useCallback(
    (patch: Partial<FullProjectData>) => {
      commitChange((prev) => ({ ...prev, ...patch }));
    },
    [commitChange]
  );

  const addStage = useCallback(
    (partial?: Partial<StageData>) => {
      const newId = `stage_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      commitChange((prev) => {
        const nextOrder = prev.stages.length;
        const newStage: StageData = {
          id: newId,
          orderIndex: nextOrder,
          title: partial?.title || `Shot ${nextOrder + 1}`,
          synopsis: partial?.synopsis || "",
          scriptContent: partial?.scriptContent || "",
          sceneNumber: partial?.sceneNumber || 1,
          shotNumber: nextOrder + 1,
          durationSec: partial?.durationSec || 3,
          backgroundColor: partial?.backgroundColor || "#FFFBEB",
          canvasObjects: partial?.canvasObjects || [],
          propertyValues: partial?.propertyValues || {
            visualdetail: "",
            cameraangle: "Eye Level",
            shotsize: "Medium Shot (MS)",
            movement: "Static",
          },
          thumbnailSvg: null,
        };
        return {
          ...prev,
          stages: [...prev.stages, newStage],
        };
      });
      setActiveStageId(newId);
    },
    [commitChange]
  );

  const duplicateStage = useCallback(
    (stageId: string) => {
      commitChange((prev) => {
        const idx = prev.stages.findIndex((s) => s.id === stageId);
        if (idx === -1) return prev;
        const src = prev.stages[idx];
        const copy: StageData = {
          ...src,
          id: `stage_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          title: `${src.title} (Copy)`,
          canvasObjects: src.canvasObjects.map((o) => ({
            ...o,
            id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          })),
          propertyValues: { ...src.propertyValues },
        };
        const updated = [
          ...prev.stages.slice(0, idx + 1),
          copy,
          ...prev.stages.slice(idx + 1),
        ].map((s, i) => ({ ...s, orderIndex: i, shotNumber: i + 1 }));
        return { ...prev, stages: updated };
      });
    },
    [commitChange]
  );

  const deleteStage = useCallback(
    (stageId: string) => {
      commitChange((prev) => {
        if (prev.stages.length <= 1) return prev;
        const remaining = prev.stages
          .filter((s) => s.id !== stageId)
          .map((s, idx) => ({ ...s, orderIndex: idx, shotNumber: idx + 1 }));
        if (activeStageId === stageId && remaining[0]) {
          setActiveStageId(remaining[0].id);
        }
        return { ...prev, stages: remaining };
      });
    },
    [commitChange, activeStageId]
  );

  const updateStage = useCallback(
    (stageId: string, patch: Partial<StageData>) => {
      commitChange((prev) => ({
        ...prev,
        stages: prev.stages.map((s) =>
          s.id === stageId ? { ...s, ...patch } : s
        ),
      }));
    },
    [commitChange]
  );

  const updateStageProperty = useCallback(
    (stageId: string, propKey: string, value: any) => {
      commitChange((prev) => ({
        ...prev,
        stages: prev.stages.map((s) =>
          s.id === stageId
            ? {
                ...s,
                propertyValues: {
                  ...s.propertyValues,
                  [propKey]: value,
                },
              }
            : s
        ),
      }));
    },
    [commitChange]
  );

  const addCanvasObject = useCallback(
    (obj: Omit<CanvasObjectItem, "id" | "zIndex">) => {
      if (!activeStage) return;
      const newObjId = `obj_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      commitChange((prev) => ({
        ...prev,
        stages: prev.stages.map((s) => {
          if (s.id !== activeStage.id) return s;
          const nextZ = s.canvasObjects.length + 1;
          return {
            ...s,
            canvasObjects: [
              ...s.canvasObjects,
              { ...obj, id: newObjId, zIndex: nextZ },
            ],
          };
        }),
      }));
      setSelectedObjectId(newObjId);
    },
    [activeStage, commitChange]
  );

  const updateCanvasObject = useCallback(
    (objId: string, patch: Partial<CanvasObjectItem>) => {
      if (!activeStage) return;
      commitChange((prev) => ({
        ...prev,
        stages: prev.stages.map((s) =>
          s.id === activeStage.id
            ? {
                ...s,
                canvasObjects: s.canvasObjects.map((o) =>
                  o.id === objId ? { ...o, ...patch } : o
                ),
              }
            : s
        ),
      }));
    },
    [activeStage, commitChange]
  );

  const deleteCanvasObject = useCallback(
    (objId: string) => {
      if (!activeStage) return;
      commitChange((prev) => ({
        ...prev,
        stages: prev.stages.map((s) =>
          s.id === activeStage.id
            ? {
                ...s,
                canvasObjects: s.canvasObjects.filter((o) => o.id !== objId),
              }
            : s
        ),
      }));
      if (selectedObjectId === objId) {
        setSelectedObjectId(null);
      }
    },
    [activeStage, commitChange, selectedObjectId]
  );

  const reorderCanvasObject = useCallback(
    (objId: string, direction: "up" | "down") => {
      if (!activeStage) return;
      commitChange((prev) => ({
        ...prev,
        stages: prev.stages.map((s) => {
          if (s.id !== activeStage.id) return s;
          const sorted = [...s.canvasObjects].sort(
            (a, b) => (a.zIndex || 0) - (b.zIndex || 0)
          );
          const idx = sorted.findIndex((o) => o.id === objId);
          if (idx === -1) return s;
          const swapIdx = direction === "up" ? idx + 1 : idx - 1;
          if (swapIdx < 0 || swapIdx >= sorted.length) return s;
          const temp = sorted[idx];
          sorted[idx] = sorted[swapIdx];
          sorted[swapIdx] = temp;
          return {
            ...s,
            canvasObjects: sorted.map((item, i) => ({
              ...item,
              zIndex: i + 1,
            })),
          };
        }),
      }));
    },
    [activeStage, commitChange]
  );

  const saveToCloud = useCallback(
    async (overrideProject?: FullProjectData) => {
      const target = overrideProject || project;
      setSaving(true);
      try {
        const res = await fetch(`/api/projects/${target.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: target.title,
            synopsis: target.synopsis,
            coverPalette: target.coverPalette,
            coverImage: target.coverImage,
            scriptContent: target.scriptContent,
            visualStyle: target.visualStyle,
            width: target.width,
            height: target.height,
            aspectRatio: target.aspectRatio,
            annotationFields: target.annotationFields,
            scenes: target.scenes,
            stageOrder: target.stageOrder,
            stages: target.stages,
            videoProject: target.videoProject,
          }),
        });
        if (res.ok) {
          const data = await res.json();
          if (data.project) {
            setProject(data.project);
          }
          setLastSavedAt(new Date().toLocaleTimeString());
        }
      } finally {
        setSaving(false);
      }
    },
    [project]
  );

  const refreshComments = useCallback(async () => {
    const res = await fetch(`/api/projects/${project.id}/comments`);
    if (res.ok) {
      const data = await res.json();
      setProject((prev) => ({ ...prev, comments: data.comments || [] }));
    }
  }, [project.id]);

  return (
    <EditorContext.Provider
      value={{
        project,
        viewMode,
        setViewMode,
        activeStageId,
        setActiveStageId,
        activeStage,
        selectedObjectId,
        setSelectedObjectId,
        selectedObject,
        activeMenu,
        setActiveMenu,
        rightPanelTab,
        setRightPanelTab,
        zoom,
        setZoom,
        saving,
        lastSavedAt,
        canUndo: past.length > 0,
        canRedo: future.length > 0,
        undo,
        redo,
        updateProjectMeta,
        addStage,
        duplicateStage,
        deleteStage,
        updateStage,
        updateStageProperty,
        addCanvasObject,
        updateCanvasObject,
        deleteCanvasObject,
        reorderCanvasObject,
        saveToCloud,
        refreshComments,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
}

export function useEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) {
    throw new Error("useEditor must be used within EditorProvider");
  }
  return ctx;
}
