import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { PRE_UNLOCKED_STAMP_IDS, STAMP_DEFS, TOTAL_STAMPS } from "../data/stamps";

export interface CapturedPhoto {
  id: number;
  url: string;
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
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [showCamera, setShowCamera] = useState(false);
  const [unlockedStampIds, setUnlockedStampIds] = useState<number[]>(PRE_UNLOCKED_STAMP_IDS);
  const [lastUnlockedStampId, setLastUnlockedStampId] = useState<number | null>(null);

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
