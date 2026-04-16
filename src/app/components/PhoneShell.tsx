import { type ReactNode, useRef, useState, useEffect } from "react";
import { useCamera } from "../context/CameraContext";
import { useLanguage } from "../context/LanguageContext";

const C = {
  navy: "#0E1B4D", royal: "#2350D8", sky: "#4B9EF7", pale: "#A8D4FF",
  ice: "#DCF0FF", cream: "#FFFBF0", yellow: "#FFD93D", mint: "#5EEAA8",
  coral: "#FF6B6B", white: "#FFFFFF",
};

export function PhoneShell({
  children,
  bg = "#DCF0FF",
}: {
  children: ReactNode;
  bg?: string;
}) {
  return (
    <div
      className="relative flex min-h-screen w-full flex-col overflow-hidden"
      style={{
        minHeight: "100dvh",
        backgroundColor: bg,
        fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      {children}
      {/* ── Global Camera Overlay ── */}
      <CameraOverlay />
    </div>
  );
}

/* ── Camera overlay rendered inside every PhoneShell ── */
function CameraOverlay() {
  const { showCamera, closeCamera, photos, addPhotos, lastUnlockedStampId } = useCamera();
  const { t } = useLanguage();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const prevUnlockedStampIdRef = useRef<number | null>(lastUnlockedStampId);

  /* show a stamp-unlock toast when a new badge is unlocked */
  useEffect(() => {
    if (
      lastUnlockedStampId != null &&
      lastUnlockedStampId !== prevUnlockedStampIdRef.current
    ) {
      setToast(t("camera_stamp_unlocked"));
      setTimeout(() => setToast(null), 2800);
    }
    prevUnlockedStampIdRef.current = lastUnlockedStampId;
  }, [lastUnlockedStampId, t]);

  const handleCamera = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addPhotos(files);
    e.target.value = "";
  };
  const handleAlbum = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) addPhotos(files);
    e.target.value = "";
  };

  if (!showCamera) return null;

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 100, backgroundColor: C.ice, display: "flex", flexDirection: "column" }}>

      {/* Header */}
      <div style={{ backgroundColor: C.royal, borderBottom: `3px solid ${C.navy}`, padding: "10px 16px 18px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff18 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
        <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: C.sky, opacity: 0.3 }} />
        <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={closeCamera}
            style={{ width: "36px", height: "36px", backgroundColor: "rgba(255,255,255,0.2)", border: `2px solid rgba(255,255,255,0.4)`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round">
              <path d="M15 6L9 12L15 18" />
            </svg>
          </button>
          <div>
            <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{t("camera_subtitle")}</p>
            <p style={{ fontSize: "20px", fontWeight: 900, color: C.white, textShadow: `1px 1px 0 ${C.navy}` }}>{t("camera_title")}</p>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "6px" }}>
            <div style={{ backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "20px", padding: "3px 12px", fontSize: "12px", fontWeight: 900, color: C.navy }}>
              {t("camera_count", { n: photos.length })}
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: "10px", padding: "14px 16px 0", flexShrink: 0 }}>
        {/* Shoot */}
        <button
          onClick={() => cameraInputRef.current?.click()}
          style={{
            flex: 1, height: "80px",
            backgroundColor: C.royal, border: `2.5px solid ${C.navy}`,
            borderRadius: "16px", boxShadow: `4px 4px 0 ${C.navy}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px",
            cursor: "pointer",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
        >
          <span style={{ fontSize: "28px" }}>📷</span>
          <span style={{ fontSize: "12px", fontWeight: 900, color: C.white }}>{t("camera_shoot")}</span>
        </button>

        {/* Album */}
        <button
          onClick={() => albumInputRef.current?.click()}
          style={{
            flex: 1, height: "80px",
            backgroundColor: C.yellow, border: `2.5px solid ${C.navy}`,
            borderRadius: "16px", boxShadow: `4px 4px 0 ${C.navy}`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px",
            cursor: "pointer",
          }}
          onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
          onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
        >
          <span style={{ fontSize: "28px" }}>🖼️</span>
          <span style={{ fontSize: "12px", fontWeight: 900, color: C.navy }}>{t("camera_album")}</span>
        </button>
      </div>

      {/* Hint */}
      <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", textAlign: "center", padding: "8px 0 0" }}>
        {t("camera_hint")}
      </p>

      {/* Hidden inputs */}
      <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleCamera} />
      <input ref={albumInputRef}  type="file" accept="image/*" multiple            style={{ display: "none" }} onChange={handleAlbum} />

      {/* Photo grid */}
      <div className="flex-1 overflow-y-auto" style={{ padding: "12px 16px 20px" }}>
        {photos.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: "12px" }}>
            <span style={{ fontSize: "56px" }}>🏛️</span>
            <p style={{ fontSize: "14px", fontWeight: 800, color: C.navy, textAlign: "center" }}>{t("camera_empty_title")}</p>
            <p style={{ fontSize: "12px", fontWeight: 600, color: "#4B6898", textAlign: "center", lineHeight: 1.6 }}>
              {t("camera_empty_sub").split("\n").map((line, i) => (
                <span key={i}>{line}{i === 0 ? <br /> : null}</span>
              ))}
            </p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#4B6898", marginBottom: "10px" }}>
              {t("camera_saved", { n: photos.length })}
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  style={{ aspectRatio: "1", borderRadius: "12px", overflow: "hidden", border: `2.5px solid ${C.navy}`, boxShadow: `2px 2px 0 ${C.navy}` }}
                >
                  <img src={photo.url} alt={t("camera_photo_alt")} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Stamp-unlock toast */}
      {toast && (
        <div style={{
          position: "absolute", bottom: "24px", left: "50%", transform: "translateX(-50%)",
          backgroundColor: C.navy, border: `2.5px solid ${C.yellow}`,
          borderRadius: "20px", boxShadow: `4px 4px 0 ${C.yellow}`,
          padding: "10px 22px",
          display: "flex", alignItems: "center", gap: "10px",
          zIndex: 10, whiteSpace: "nowrap",
          animation: "camToastIn 0.3s ease-out",
        }}>
          <span style={{ fontSize: "22px" }}>🎉</span>
          <span style={{ fontSize: "13px", fontWeight: 900, color: C.yellow }}>{toast}</span>
          <style>{`@keyframes camToastIn { from { transform: translateX(-50%) translateY(16px); opacity: 0; } to { transform: translateX(-50%) translateY(0); opacity: 1; } }`}</style>
        </div>
      )}
    </div>
  );
}

/* ─── iOS-style status bar ─── */
export function StatusBar({ dark = false }: { dark?: boolean }) {
  void dark;
  return null;
}

/* ─── Reusable comic card ─── */
export function ComicCard({
  children,
  style,
  className = "",
  onClick,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        backgroundColor: "#FFFFFF",
        border: "2.5px solid #0E1B4D",
        borderRadius: "16px",
        boxShadow: "4px 4px 0px #0E1B4D",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ─── Comic burst / starburst SVG ─── */
export function Burst({
  size = 40,
  color = "#FFD93D",
  text = "",
  textColor = "#0E1B4D",
}: {
  size?: number;
  color?: string;
  text?: string;
  textColor?: string;
}) {
  const pts = 8;
  const outerR = size / 2;
  const innerR = outerR * 0.6;
  const cx = size / 2;
  const cy = size / 2;
  const points = Array.from({ length: pts * 2 }, (_, i) => {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / pts) * i - Math.PI / 2;
    return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
  }).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ flexShrink: 0 }}>
     
    </svg>
  );
}

/* ─── Comic speech bubble ─── */
export function SpeechBubble({ children, style }: { children: ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        position: "relative",
        backgroundColor: "#FFFFFF",
        border: "2.5px solid #0E1B4D",
        borderRadius: "16px",
        boxShadow: "3px 3px 0px #0E1B4D",
        padding: "10px 14px",
        ...style,
      }}
    >
      {children}
      {/* tail */}
      <div
        style={{
          position: "absolute",
          bottom: "-14px",
          left: "20px",
          width: 0,
          height: 0,
          borderLeft: "10px solid transparent",
          borderRight: "6px solid transparent",
          borderTop: "14px solid #0E1B4D",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-10px",
          left: "22px",
          width: 0,
          height: 0,
          borderLeft: "8px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: "12px solid #FFFFFF",
        }}
      />
    </div>
  );
}
