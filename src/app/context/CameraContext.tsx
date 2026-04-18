import { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from "react";
import { detectBuildingCode } from "../data/buildingOcr";
import { PRE_UNLOCKED_STAMP_IDS, STAMP_DEFS, TOTAL_STAMPS } from "../data/stamps";
import { runBuildingOcrOnFile } from "../utils/runBuildingOcr";

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error("read file"));
    r.readAsDataURL(file);
  });
}

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

export type CameraUnlockEvent =
  | { id: number; kind: "building"; code: string; grantedStamp: boolean }
  | { id: number; kind: "random" };

interface CameraCtx {
  photos: CapturedPhoto[];
  showCamera: boolean;
  openCamera: () => void;
  closeCamera: () => void;
  addPhotos: (files: File[]) => void;
  unlockedStampIds: number[];
  lastUnlockedStampId: number | null;
  stampCheckedCount: number;
  ocrScanning: boolean;
  lastUnlockEvent: CameraUnlockEvent | null;
  dismissUnlockEvent: () => void;
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
  ocrScanning: false,
  lastUnlockEvent: null,
  dismissUnlockEvent: () => {},
});

export function CameraProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>(() => getInitialCameraOnce().photos);
  const [showCamera, setShowCamera] = useState(false);
  const [unlockedStampIds, setUnlockedStampIds] = useState<number[]>(() => getInitialCameraOnce().unlockedStampIds);
  const [lastUnlockedStampId, setLastUnlockedStampId] = useState<number | null>(null);
  const [ocrScanning, setOcrScanning] = useState(false);
  const [lastUnlockEvent, setLastUnlockEvent] = useState<CameraUnlockEvent | null>(null);
  const stampIdsRef = useRef<number[]>(getInitialCameraOnce().unlockedStampIds);
  const nextEventId = useRef(0);

  useEffect(() => {
    stampIdsRef.current = unlockedStampIds;
  }, [unlockedStampIds]);

  useEffect(() => {
    saveCameraToStorage(photos, unlockedStampIds);
  }, [photos, unlockedStampIds]);

  const openCamera = useCallback(() => setShowCamera(true), []);
  const closeCamera = useCallback(() => setShowCamera(false), []);
  const dismissUnlockEvent = useCallback(() => setLastUnlockEvent(null), []);

  const addPhotos = useCallback((files: File[]) => {
    if (files.length === 0) return;
    void (async () => {
      setOcrScanning(true);
      try {
        for (const file of files) {
        const url = await readFileAsDataUrl(file);
        setPhotos((prev) => [...prev, { id: Date.now() + Math.random(), url }]);

        let ocr = "";
        try {
          ocr = await runBuildingOcrOnFile(file);
        } catch {
          ocr = "";
        }
        const building = detectBuildingCode(ocr);
        const eventId = ++nextEventId.current;

        const prevStamps = stampIdsRef.current;
        let newStamp: number | null = null;
        if (prevStamps.length < TOTAL_STAMPS) {
          const locked = STAMP_DEFS.map((s) => s.id).filter((id) => !prevStamps.includes(id));
          if (locked.length) {
            const unlockedId = locked[Math.floor(Math.random() * locked.length)];
            newStamp = unlockedId;
            const next = [...prevStamps, unlockedId].sort((a, b) => a - b);
            stampIdsRef.current = next;
            setUnlockedStampIds(next);
            setLastUnlockedStampId(unlockedId);
          }
        }

        if (building) {
          setLastUnlockEvent({
            id: eventId,
            kind: "building",
            code: building,
            grantedStamp: newStamp != null,
          });
        } else if (newStamp != null) {
          setLastUnlockEvent({ id: eventId, kind: "random" });
        }
        }
      } finally {
        setOcrScanning(false);
      }
    })();
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
        ocrScanning,
        lastUnlockEvent,
        dismissUnlockEvent,
      }}
    >
      {children}
    </CameraContext.Provider>
  );
}

export const useCamera = () => useContext(CameraContext);
