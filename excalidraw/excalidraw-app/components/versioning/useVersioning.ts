import { useCallback, useEffect, useState } from "react";

import { CaptureUpdateAction } from "@excalidraw/excalidraw";

import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
} from "@excalidraw/excalidraw/types";

// Key used for persisting versions in localStorage
const LS_KEY = "excalidraw.boardVersions";

export interface SceneData {
  elements: ReturnType<ExcalidrawImperativeAPI["getSceneElements"]>;
  appState: AppState;
  files: BinaryFiles;
}

export interface BoardVersion {
  id: string;
  label: string;
  timestamp: string; // ISO string
  scene: SceneData;
}

interface UseVersioningApi {
  versions: BoardVersion[];
  saveVersion: (label?: string) => Promise<void>;
  restoreVersion: (id: string) => void;
  deleteVersion: (id: string) => void;
  clearAll: () => void;
  isSaving: boolean;
  lastSavedId: string | null;
  error: string | null;
}

// Helper to read versions from localStorage safely
const readVersions = (): BoardVersion[] => {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed as BoardVersion[];
    }
  } catch (err) {
    console.warn("Failed to parse stored versions", err);
  }
  return [];
};

// Helper to write versions to localStorage
const writeVersions = (versions: BoardVersion[]) => {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(versions));
  } catch (err) {
    console.warn("Failed to persist versions", err);
    throw err;
  }
};

export const useVersioning = (
  excalidrawAPI: ExcalidrawImperativeAPI | null,
): UseVersioningApi => {
  const [versions, setVersions] = useState<BoardVersion[]>(() =>
    readVersions(),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Keep localStorage in sync whenever versions change
  useEffect(() => {
    try {
      writeVersions(versions);
    } catch (err: any) {
      setError(err.message || "Failed to save versions");
    }
  }, [versions]);

  const saveVersion = useCallback(
    async (label?: string) => {
      if (!excalidrawAPI) {
        return;
      }
      setIsSaving(true);
      setError(null);
      try {
        const scene: SceneData = {
          elements: excalidrawAPI.getSceneElements(),
          // full app state copy — future backend layer could prune ephemeral fields
          appState: { ...(excalidrawAPI.getAppState() as AppState) },
          files: excalidrawAPI.getFiles(),
        };
        const id = `${
          globalThis.crypto?.randomUUID?.() || Date.now().toString()
        }`;
        const version: BoardVersion = {
          id,
          label: label?.trim() || `Version ${versions.length + 1}`,
          timestamp: new Date().toISOString(),
          scene,
        };
        setVersions((prev) => [version, ...prev]);
        setLastSavedId(id);
      } catch (err: any) {
        setError(err.message || "Failed to create version");
      } finally {
        setIsSaving(false);
      }
    },
    [excalidrawAPI, versions.length],
  );

  const restoreVersion = useCallback(
    (id: string) => {
      if (!excalidrawAPI) {
        return;
      }
      const version = versions.find((v) => v.id === id);
      if (!version) {
        return;
      }
      // updateScene does not take files, so we add them separately
      excalidrawAPI.updateScene({
        elements: version.scene.elements as any,
        appState: version.scene.appState,
        captureUpdate: CaptureUpdateAction.NEVER,
      });
      const files = version.scene.files;
      if (files && Object.keys(files).length) {
        const fileArray = Object.values(files);
        if (fileArray.length) {
          excalidrawAPI.addFiles(fileArray);
        }
      }
    },
    [excalidrawAPI, versions],
  );

  const deleteVersion = useCallback((id: string) => {
    setVersions((prev) => prev.filter((v) => v.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setVersions([]);
  }, []);

  return {
    versions,
    saveVersion,
    restoreVersion,
    deleteVersion,
    clearAll,
    isSaving,
    lastSavedId,
    error,
  };
};

export type { UseVersioningApi };
