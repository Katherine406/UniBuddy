import { useNavigate } from "react-router";
import { Burst } from "./PhoneShell";
import { useLanguage } from "../context/LanguageContext";

/* halftone dots bg */
const dotsBg: React.CSSProperties = {
  backgroundImage: "radial-gradient(circle, #0E1B4D1A 1.2px, transparent 1.2px)",
  backgroundSize: "14px 14px",
};

export function SplashScreen() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const featureChips = [
    { emoji: "📸", key: "splash_f1" },
    { emoji: "🗺️", key: "splash_f2" },
    { emoji: "🧭", key: "splash_f3" },
    { emoji: "🏅", key: "splash_f4" },
  ];

  return (
    <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: "#A8D4FF" }}>
      <div
        style={{
          width: "390px",
          height: "844px",
          backgroundColor: "#DCF0FF",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          borderRadius: "36px",
          border: "3px solid #0E1B4D",
          boxShadow: "6px 6px 0px #0E1B4D",
          ...dotsBg,
        }}
      >
        {/* ── Top coloured band ── */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "420px",
            backgroundColor: "#2350D8",
            borderBottom: "3px solid #0E1B4D",
            overflow: "hidden",
          }}
        >
          {/* inner dots on blue */}
          <div style={{ ...dotsBg, position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff22 1.2px, transparent 1.2px)" }} />

          {/* Decorative circles */}
          <div style={{ position: "absolute", top: "-60px", right: "-60px", width: "200px", height: "200px", borderRadius: "50%", backgroundColor: "#4B9EF7", border: "3px solid #0E1B4D" }} />
          <div style={{ position: "absolute", top: "30px", right: "20px", width: "100px", height: "100px", borderRadius: "50%", backgroundColor: "#A8D4FF", border: "3px solid #0E1B4D" }} />
          <div style={{ position: "absolute", bottom: "40px", left: "-30px", width: "120px", height: "120px", borderRadius: "50%", backgroundColor: "#4B9EF7", border: "3px solid #0E1B4D" }} />
        </div>

        {/* ── Burst decorations ── */}
        <div style={{ position: "absolute", top: "40px", left: "26px" }}>
          <Burst size={52} color="#FFD93D"  />
        </div>
        <div style={{ position: "absolute", top: "160px", right: "36px" }}>
          <Burst size={36} color="#5EEAA8" />
        </div>
        <div style={{ position: "absolute", top: "260px", left: "50px" }}>
          <Burst size={28} color="#FFD93D" />
        </div>

        {/* ── Status bar ── */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 20, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 24px 0" }}>
          <span style={{ fontSize: "15px", fontWeight: 800, color: "white" }}>9:41</span>
          <div style={{ backgroundColor: "#0E1B4D", borderRadius: "20px", width: "118px", height: "34px" }} />
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="17" height="12" viewBox="0 0 17 12" fill="white"><rect x="0" y="4" width="3" height="8" rx="0.8" opacity="0.5" /><rect x="4.5" y="2.5" width="3" height="9.5" rx="0.8" opacity="0.7" /><rect x="9" y="1" width="3" height="11" rx="0.8" opacity="0.9" /><rect x="13.5" y="0" width="3" height="12" rx="0.8" /></svg>
            <svg width="15" height="12" viewBox="0 0 15 12" fill="white"><path d="M7.5 2.4C9.8 2.4 11.9 3.4 13.3 5L14.8 3.4C13 1.3 10.4 0 7.5 0C4.6 0 2 1.3 0.2 3.4L1.7 5C3.1 3.4 5.2 2.4 7.5 2.4Z" /><path d="M7.5 5.5C9 5.5 10.3 6.1 11.3 7.1L12.8 5.5C11.4 4.1 9.5 3.2 7.5 3.2C5.5 3.2 3.6 4.1 2.2 5.5L3.7 7.1C4.7 6.1 6 5.5 7.5 5.5Z" /><circle cx="7.5" cy="10" r="1.8" /></svg>
            <svg width="25" height="12" viewBox="0 0 25 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3.5" stroke="white" strokeOpacity="0.5" /><rect x="2" y="2" width="16" height="8" rx="2" fill="white" /><path d="M23 4.5V7.5C23.8 7.2 24.5 6.4 24.5 6C24.5 5.6 23.8 4.8 23 4.5Z" fill="white" fillOpacity="0.4" /></svg>
          </div>
        </div>

        {/* ── Big logo / campus emoji ── */}
        <div style={{ position: "absolute", top: "95px", left: "50%", transform: "translateX(-50%)", zIndex: 10, textAlign: "center" }}>
          <div
            style={{
              width: "130px",
              height: "130px",
              backgroundColor: "#FFFBF0",
              border: "3px solid #0E1B4D",
              borderRadius: "32px",
              boxShadow: "5px 5px 0px #0E1B4D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "72px",
              margin: "0 auto",
            }}
          >🎓</div>
        </div>

        {/* ── Bottom white panel ── */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "440px",
            backgroundColor: "#FFFBF0",
            borderTop: "3px solid #0E1B4D",
            borderTopLeftRadius: "32px",
            borderTopRightRadius: "32px",
            padding: "40px 28px 28px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* location tag */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              backgroundColor: "#A8D4FF",
              border: "2px solid #0E1B4D",
              borderRadius: "20px",
              padding: "4px 12px",
              marginBottom: "14px",
              boxShadow: "2px 2px 0 #0E1B4D",
              alignSelf: "flex-start",
            }}
          >
            <span style={{ fontSize: "14px" }}>📍</span>
            <span className="font-[Playpen_Sans]" style={{ fontSize: "12px", fontWeight: 800, color: "#0E1B4D" }}>{t("splash_location")}</span>
          </div>

          {/* Title */}
          <div style={{ marginBottom: "8px" }}>
            <span
              style={{
                fontSize: "58px",
                fontWeight: 900,
                letterSpacing: "-2.2px",
                lineHeight: 1,
                display: "inline-block",
                background: "linear-gradient(90deg, #B46CFF 0%, #9D6CFF 22%, #7D7CFF 44%, #5F98FF 66%, #4AB8FF 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
                WebkitTextStroke: "2.3px #1A2D96",
                textShadow:
                  "-3px -3px 0 #FFFFFF, 0 -3px 0 #FFFFFF, 3px -3px 0 #FFFFFF, -3px 0 0 #FFFFFF, 3px 0 0 #FFFFFF, -3px 3px 0 #FFFFFF, 0 3px 0 #FFFFFF, 3px 3px 0 #FFFFFF, 0 8px 12px rgba(35,80,216,0.28)",
              }}
            >
              UniBuddy
            </span>
          </div>
          <p
            style={{
              fontSize: "14px",
              fontWeight: 700,
              color: "#0E1B4D",
              marginBottom: "28px",
              borderLeft: "3px solid #FFD93D",
              paddingLeft: "10px",
            }}
          >
            {t("splash_subtitle")} 🗺️
          </p>

          {/* CTA button */}
          <button
            onClick={() => navigate("/home")}
            style={{
              width: "100%",
              height: "58px",
              backgroundColor: "#2350D8",
              border: "2.5px solid #0E1B4D",
              borderRadius: "16px",
              boxShadow: "4px 4px 0px #0E1B4D",
              color: "white",
              fontSize: "18px",
              fontWeight: 900,
              letterSpacing: "0.5px",
              cursor: "pointer",
              transition: "transform 0.1s",
              marginBottom: "14px",
            }}
            onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
            onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
          >
            {t("splash_cta")}
          </button>

          {/* Feature chips */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {featureChips.map((f) => (
              <div
                key={f.key}
                style={{
                  backgroundColor: "#DCF0FF",
                  border: "2px solid #0E1B4D",
                  borderRadius: "20px",
                  padding: "3px 10px",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "#0E1B4D",
                  boxShadow: "2px 2px 0px #0E1B4D",
                }}
              >
                {f.emoji} {t(f.key)}
              </div>
            ))}
          </div>

          {/* Home indicator */}
          <div style={{ display: "flex", justifyContent: "center", marginTop: "auto", paddingTop: "12px" }}>
            <div style={{ width: "130px", height: "4px", backgroundColor: "#0E1B4D", borderRadius: "4px" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
