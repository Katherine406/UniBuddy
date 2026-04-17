import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { PRE_UNLOCKED_STAMP_IDS, STAMP_DEFS, TOTAL_STAMPS } from "../data/stamps";

export interface CapturedPhoto {
  id: number;
  url: string;
}

const CAMERA_STORAGE_KEY = "unibuddy_camera_v1";

const validStampId = (id: unknown): id is number =>
  typeof id === "number" && Number.isInteger(id) && id >= 1 && id <= TOTAL_STAMPS;

function loadCameraFromStorage(): { photos: CapturedPhoto[]; unlockedStampIds: number[] } {
  if (typeof window === "undefined") {
    return { photos: [], unlockedStampIds: [...PRE_UNLOCKED_STAMP_IDS] };
  }
  try {
    const raw = localStorage.getItem(CAMERA_STORAGE_KEY);
    if (!raw) return { photos: [], unlockedStampIds: [...PRE_UNLOCKED_STAMP_IDS] };
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") {
      return { photos: [], unlockedStampIds: [...PRE_UNLOCKED_STAMP_IDS] };
    }
    const rec = parsed as Record<string, unknown>;

    const photos: CapturedPhoto[] = Array.isArray(rec.photos)
      ? rec.photos.filter(
          (p): p is CapturedPhoto =>
            !!p &&
            typeof p === "object" &&
            typeof (p as CapturedPhoto).id === "number" &&
            typeof (p as CapturedPhoto).url === "string" &&
            (p as CapturedPhoto).url.length > 0
        )
      : [];

    let unlockedStampIds: number[] = [...PRE_UNLOCKED_STAMP_IDS];
    if (Array.isArray(rec.unlockedStampIds)) {
      const ids = rec.unlockedStampIds.filter(validStampId);
      unlockedStampIds = [...new Set(ids)].sort((a, b) => a - b);
    }

    return { photos, unlockedStampIds };
  } catch {
    return { photos: [], unlockedStampIds: [...PRE_UNLOCKED_STAMP_IDS] };
  }
}

function saveCameraToStorage(photos: CapturedPhoto[], unlockedStampIds: number[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CAMERA_STORAGE_KEY, JSON.stringify({ photos, unlockedStampIds }));
  } catch {
    console.warn("UniBuddy: 无法写入本地缓存（可能超出浏览器存储上限）。");
  }
}

/** 首次挂载只读一次 localStorage，避免 Provider 重渲染时重复解析 */
let initialCameraCache: { photos: CapturedPhoto[]; unlockedStampIds: number[] } | null = null;
function getInitialCameraOnce() {
  if (!initialCameraCache) initialCameraCache = loadCameraFromStorage();
  return initialCameraCache;
}

interface CameraCtx {
  photos: CapturedPhoto[];
  showCamera: boolean;
  openCamera: () => void;
  closeCamera: () => void;
  addPhotos: (files: File[]) => void;
  unlockedStampIds: number[];
  lastUnlockedStampId: number | null;
  stampCheckedCount: number;
}

const CameraContext = createContext<CameraCtx>({
  photos: [],
  showCamera: false,
  openCamera: () => {},
  closeCamera: () => {},
  addPhotos: () => {},
  unlockedStampIds: PRE_UNLOCKED_STAMP_IDS,
  lastUnlockedStampId: null,
  stampCheckedCount: PRE_UNLOCKED_STAMP_IDS.length,
});

export function CameraProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>(() => getInitialCameraOnce().photos);
  const [showCamera, setShowCamera] = useState(false);
  const [unlockedStampIds, setUnlockedStampIds] = useState<number[]>(() => getInitialCameraOnce().unlockedStampIds);
  const [lastUnlockedStampId, setLastUnlockedStampId] = useState<number | null>(null);

  useEffect(() => {
    saveCameraToStorage(photos, unlockedStampIds);
  }, [photos, unlockedStampIds]);

  const openCamera = useCallback(() => setShowCamera(true), []);
  const closeCamera = useCallback(() => setShowCamera(false), []);

  const addPhotos = useCallback((files: File[]) => {
    if (files.length === 0) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPhotos((prev) => [...prev, { id: Date.now() + Math.random(), url }]);

        // Each new photo triggers unlocking 1 random *locked* stamp.
        setUnlockedStampIds((prevUnlocked) => {
          if (prevUnlocked.length >= TOTAL_STAMPS) return prevUnlocked;

          const lockedStampIds = STAMP_DEFS.map((s) => s.id).filter((id) => !prevUnlocked.includes(id));
          if (lockedStampIds.length === 0) return prevUnlocked;

          const randomIndex = Math.floor(Math.random() * lockedStampIds.length);
          const unlockedId = lockedStampIds[randomIndex];

          setLastUnlockedStampId(unlockedId);
          return [...prevUnlocked, unlockedId];
        });
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const stampCheckedCount = unlockedStampIds.length;

  return (
    <CameraContext.Provider
      value={{
        photos,
        showCamera,
        openCamera,
        closeCamera,
        addPhotos,
        unlockedStampIds,
        lastUnlockedStampId,
        stampCheckedCount,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export const useCamera = () => useContext(CameraContext);
