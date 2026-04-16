import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

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
  /* how many stamps are currently checked (4 pre-checked + 1 per photo, max 12) */
  stampCheckedCount: number;
}

const CameraContext = createContext<CameraCtx>({
  photos: [],
  showCamera: false,
  openCamera: () => {},
  closeCamera: () => {},
  addPhotos: () => {},
  stampCheckedCount: 4,
});

export const PRE_CHECKED = 4;
export const TOTAL_STAMPS = 12;

export function CameraProvider({ children }: { children: ReactNode }) {
  const [photos, setPhotos] = useState<CapturedPhoto[]>([]);
  const [showCamera, setShowCamera] = useState(false);

  const openCamera = useCallback(() => setShowCamera(true), []);
  const closeCamera = useCallback(() => setShowCamera(false), []);

  const addPhotos = useCallback((files: File[]) => {
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target?.result as string;
        setPhotos((prev) => [...prev, { id: Date.now() + Math.random(), url }]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const stampCheckedCount = Math.min(PRE_CHECKED + photos.length, TOTAL_STAMPS);

  return (
    <CameraContext.Provider value={{ photos, showCamera, openCamera, closeCamera, addPhotos, stampCheckedCount }}>
      {children}
    </CameraContext.Provider>
  );
}

export const useCamera = () => useContext(CameraContext);
