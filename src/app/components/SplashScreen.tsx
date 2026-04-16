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
    <div
      className="flex min-h-screen w-full justify-center"
      style={{
        minHeight: "100dvh",
        backgroundColor: "#A8D4FF",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "560px",
          minHeight: "100dvh",
          backgroundColor: "#DCF0FF",
          fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          position: "relative",
          overflow: "hidden",
          borderRadius: "clamp(0px, 2vw, 28px)",
          border: "3px solid #0E1B4D",
          boxShadow: "0 18px 40px rgba(14, 27, 77, 0.18)",
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
            height: "clamp(320px, 42vh, 420px)",
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

        {/* ── Big logo / campus emoji ── */}
        <div style={{ position: "absolute", top: "95px", left: "50%", transform: "translateX(-50%)", zIndex: 10, textAlign: "center" }}>
          <div
            style={{
              width: "clamp(112px, 24vw, 130px)",
              height: "clamp(112px, 24vw, 130px)",
              backgroundColor: "#FFFBF0",
              border: "3px solid #0E1B4D",
              borderRadius: "32px",
              boxShadow: "5px 5px 0px #0E1B4D",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(56px, 12vw, 72px)",
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
            height: "clamp(400px, 46vh, 460px)",
            backgroundColor: "#FFFBF0",
            borderTop: "3px solid #0E1B4D",
            borderTopLeftRadius: "32px",
            borderTopRightRadius: "32px",
            padding: "clamp(32px, 5vw, 40px) clamp(20px, 5vw, 28px) 28px",
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
                fontSize: "clamp(44px, 10vw, 58px)",
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

        </div>
      </div>
    </div>
  );
}
