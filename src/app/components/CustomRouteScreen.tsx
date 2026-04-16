import { useState } from "react";
import { useNavigate } from "react-router";
import { PhoneShell, StatusBar, ComicCard, Burst } from "./PhoneShell";
import { BottomNav } from "./BottomNav";
import { useFavorites } from "../context/FavoritesContext";
import { useLanguage } from "../context/LanguageContext";
import {
  IconHeart, IconPlay, IconReset, IconBack, IconPin, IconCheck, IconSparkle,
} from "./ComicIcons";

const C = {
  navy: "#0E1B4D", royal: "#2350D8", sky: "#4B9EF7", pale: "#A8D4FF",
  ice: "#DCF0FF", cream: "#FFFBF0", yellow: "#FFD93D", coral: "#FF6B6B",
  mint: "#5EEAA8", purple: "#7B5CF5", white: "#FFFFFF",
};

interface BuildingDef {
  id: string; nameKey: string; emoji: string; catKey: string;
  color: string; bg: string; x: number; y: number;
}

const buildingDefs: BuildingDef[] = [
  { id: "gate",     nameKey: "b_gate",     emoji: "🚪", catKey: "cat_entrance",   color: C.navy,   bg: C.ice,     x: 0, y: 0 },
  { id: "admin",    nameKey: "b_admin",    emoji: "🏛️", catKey: "cat_admin_type", color: C.royal,  bg: C.pale,    x: 1, y: 2 },
  { id: "library",  nameKey: "b_library",  emoji: "📚", catKey: "cat_academic",   color: C.royal,  bg: C.ice,     x: 3, y: 1 },
  { id: "square",   nameKey: "b_square",   emoji: "🌸", catKey: "cat_leisure",    color: C.purple, bg: "#E8D5FF", x: 4, y: 3 },
  { id: "gym",      nameKey: "b_gym",      emoji: "🏃", catKey: "cat_sports",     color: C.navy,   bg: C.yellow,  x: 6, y: 1 },
  { id: "canteen",  nameKey: "b_canteen",  emoji: "🍜", catKey: "cat_dining",     color: C.royal,  bg: C.pale,    x: 5, y: 4 },
  { id: "lake",     nameKey: "b_lake",     emoji: "💧", catKey: "cat_nature",     color: C.sky,    bg: C.ice,     x: 2, y: 5 },
  { id: "art",      nameKey: "b_art",      emoji: "🎨", catKey: "cat_arts",       color: C.purple, bg: "#E8D5FF", x: 7, y: 2 },
  { id: "research", nameKey: "b_research", emoji: "🔬", catKey: "cat_academic",   color: C.royal,  bg: C.pale,    x: 8, y: 4 },
  { id: "dorm",     nameKey: "b_dorm",     emoji: "🏠", catKey: "cat_living",     color: C.sky,    bg: C.ice,     x: 1, y: 6 },
  { id: "history",  nameKey: "b_history",  emoji: "🏺", catKey: "cat_culture",    color: C.purple, bg: "#E8D5FF", x: 3, y: 6 },
  { id: "maker",    nameKey: "b_maker",    emoji: "⚙️", catKey: "cat_innovation", color: C.navy,   bg: C.mint,    x: 6, y: 5 },
];

const categoryKeys = [
  "cat_all", "cat_academic", "cat_sports", "cat_leisure",
  "cat_dining", "cat_arts", "cat_nature", "cat_living", "cat_culture", "cat_innovation",
];

function generateRoute(sel: BuildingDef[]): BuildingDef[] {
  if (sel.length <= 2) return [...sel];
  const d = (a: BuildingDef, b: BuildingDef) => Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);
  const rem = [...sel.slice(1)]; const route = [sel[0]];
  while (rem.length) {
    const last = route[route.length - 1]; let mi = 0, md = Infinity;
    rem.forEach((b, i) => { const v = d(last, b); if (v < md) { md = v; mi = i; } });
    route.push(rem.splice(mi, 1)[0]);
  }
  return route;
}

function calcTime(route: BuildingDef[]): number {
  let time = 0;
  for (let i = 0; i < route.length - 1; i++) {
    const a = route[i], b = route[i + 1];
    time += Math.max(2, Math.round(Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2) * 4));
  }
  return time;
}

type Phase = "select" | "result";

export function CustomRouteScreen() {
  const navigate = useNavigate();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLanguage();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(["gate"]));
  const [activeCatKey, setActiveCatKey] = useState("cat_all");
  const [phase, setPhase] = useState<Phase>("select");
  const [route, setRoute] = useState<BuildingDef[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    if (id === "gate") return;
    setSelectedIds((p) => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const filtered = activeCatKey === "cat_all"
    ? buildingDefs
    : buildingDefs.filter((b) => b.catKey === activeCatKey);

  const selectedBuildings = buildingDefs.filter((b) => selectedIds.has(b.id));

  const routeId = `custom-${[...selectedIds].sort().join("-")}`;
  const fav = isFavorite(routeId);

  const handleGenerate = () => {
    if (selectedIds.size < 2) return;
    setLoading(true);
    setTimeout(() => { setRoute(generateRoute(selectedBuildings)); setLoading(false); setPhase("result"); }, 900);
  };
  const handleReset = () => { setSelectedIds(new Set(["gate"])); setRoute(null); setPhase("select"); };

  const total = route ? calcTime(route) : 0;

  return (
    <PhoneShell bg={C.ice}>
      <StatusBar />

      {/* Header */}
      <div style={{ backgroundColor: C.sky, borderBottom: `3px solid ${C.navy}`, padding: "8px 20px 22px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff22 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
        <div style={{ position: "absolute", bottom: "8px", right: "20px" }}><Burst size={44} color={C.yellow} text="DIY" textColor={C.navy} /></div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <button onClick={() => navigate("/route")} style={{ width: "32px", height: "32px", backgroundColor: "rgba(255,255,255,0.3)", border: `2px solid rgba(255,255,255,0.5)`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconBack />
            </button>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>{t("custom_back")}</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}` }}>🧩 {t("custom_title")}</h1>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)", marginTop: "2px" }}>{t("custom_subtitle")}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto" style={{ paddingBottom: "90px" }}>

        {/* SELECT */}
        {phase === "select" && (
          <div style={{ padding: "14px 16px 0" }}>
            {/* selected chips */}
            <div style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: C.navy }}>
                  {t("custom_selected")} <span style={{ color: C.royal }}>{selectedIds.size}</span> / {t("custom_min2")}
                </span>
                {selectedIds.size >= 2 && (
                  <div style={{ display: "flex", alignItems: "center", gap: "4px", backgroundColor: C.mint, border: `1.5px solid ${C.navy}`, borderRadius: "8px", padding: "1px 8px", boxShadow: `2px 2px 0 ${C.navy}` }}>
                    <IconCheck size={11} color={C.navy} />
                    <span style={{ fontSize: "10px", fontWeight: 900, color: C.navy }}>{t("custom_ready")}</span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", minHeight: "28px" }}>
                {selectedBuildings.map((b) => (
                  <button key={b.id} onClick={() => toggle(b.id)} style={{ backgroundColor: b.bg, border: `2px solid ${b.color}`, borderRadius: "20px", padding: "2px 10px", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", boxShadow: `2px 2px 0 ${b.id === "gate" ? "#aaa" : b.color}` }}>
                    <span style={{ fontSize: "12px" }}>{b.emoji}</span>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: b.color }}>{t(b.nameKey)}</span>
                    {b.id !== "gate" && <span style={{ fontSize: "13px", fontWeight: 900, color: b.color, lineHeight: 1 }}>×</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* category filter */}
            <div style={{ display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "10px", scrollbarWidth: "none" }}>
              {categoryKeys.map((catKey) => (
                <button
                  key={catKey}
                  onClick={() => setActiveCatKey(catKey)}
                  style={{ flexShrink: 0, padding: "3px 10px", borderRadius: "20px", fontSize: "11px", fontWeight: 800, cursor: "pointer", backgroundColor: activeCatKey === catKey ? C.royal : C.white, color: activeCatKey === catKey ? C.white : "#4B6898", border: `2px solid ${activeCatKey === catKey ? C.navy : C.pale}`, boxShadow: activeCatKey === catKey ? `2px 2px 0 ${C.navy}` : "none" }}
                >
                  {t(catKey)}
                </button>
              ))}
            </div>

            {/* Building grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", marginBottom: "14px" }}>
              {filtered.map((b) => {
                const isSel = selectedIds.has(b.id);
                const isFixed = b.id === "gate";
                return (
                  <button
                    key={b.id} onClick={() => toggle(b.id)}
                    style={{
                      height: "90px", position: "relative",
                      backgroundColor: isSel ? b.bg : C.white,
                      border: `2.5px solid ${isSel ? b.color : C.pale}`,
                      borderRadius: "14px",
                      boxShadow: isSel ? `3px 3px 0 ${b.color}` : `2px 2px 0 ${C.pale}`,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "3px",
                      cursor: "pointer",
                    }}
                    onMouseDown={(e) => (e.currentTarget.style.transform = "translate(1px,1px)")}
                    onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
                  >
                    {isSel && (
                      <div style={{ position: "absolute", top: "4px", right: "4px", width: "16px", height: "16px", borderRadius: "50%", backgroundColor: b.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <IconCheck size={9} color="white" />
                      </div>
                    )}
                    {isFixed && (
                      <div style={{ position: "absolute", top: "3px", left: "5px", backgroundColor: C.pale, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "0 5px", fontSize: "9px", fontWeight: 900, color: C.navy }}>{t("custom_start_pt")}</div>
                    )}
                    <span style={{ fontSize: "24px" }}>{b.emoji}</span>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: isSel ? b.color : C.navy, textAlign: "center" }}>{t(b.nameKey)}</span>
                    <span style={{ fontSize: "9px", fontWeight: 600, color: "#4B6898" }}>{t(b.catKey)}</span>
                  </button>
                );
              })}
            </div>

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={selectedIds.size < 2 || loading}
              style={{
                width: "100%", height: "52px",
                backgroundColor: selectedIds.size >= 2 ? C.royal : "#E2E8F0",
                border: `2.5px solid ${selectedIds.size >= 2 ? C.navy : C.pale}`,
                borderRadius: "12px", boxShadow: selectedIds.size >= 2 ? `3px 3px 0 ${C.navy}` : "none",
                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                color: selectedIds.size >= 2 ? C.white : "#94A3B8",
                fontSize: "15px", fontWeight: 900, marginBottom: "4px",
                cursor: selectedIds.size >= 2 ? "pointer" : "not-allowed",
              }}
            >
              {loading ? (
                <>
                  <div style={{ width: "18px", height: "18px", border: `3px solid ${C.white}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                  {t("custom_planning")}
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </>
              ) : (
                <>
                  <IconSparkle size={18} color={selectedIds.size >= 2 ? C.yellow : "#94A3B8"} />
                  {selectedIds.size >= 2 ? `${t("custom_gen_ready")} (${selectedIds.size})` : t("custom_gen_hint")}
                </>
              )}
            </button>
          </div>
        )}

        {/* RESULT */}
        {phase === "result" && route && (
          <div style={{ padding: "14px 16px 0" }}>
            {/* Summary */}
            <div style={{ backgroundColor: C.royal, border: `2.5px solid ${C.navy}`, borderRadius: "16px", boxShadow: `5px 5px 0 ${C.navy}`, padding: "16px", marginBottom: "12px", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff18 1.2px, transparent 1.2px)", backgroundSize: "12px 12px" }} />
              <div style={{ position: "absolute", top: "8px", right: "12px" }}><Burst size={44} color={C.yellow} /></div>
              <div style={{ position: "relative", zIndex: 1 }}>
                <p style={{ fontSize: "17px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}`, marginBottom: "10px" }}>{t("custom_my_route")}</p>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[
                    `📍 ${t("custom_n_places", { n: route.length })}`,
                    `⏱ ${t("custom_walk", { n: total })}`,
                    ...(fav ? ["❤️"] : []),
                  ].map((tag) => (
                    <div key={tag} style={{ backgroundColor: "rgba(255,255,255,0.2)", border: `1.5px solid rgba(255,255,255,0.4)`, borderRadius: "20px", padding: "2px 10px", fontSize: "12px", fontWeight: 800, color: C.white }}>{tag}</div>
                  ))}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <ComicCard style={{ padding: "14px", marginBottom: "12px" }}>
              <p style={{ fontSize: "14px", fontWeight: 800, color: C.navy, marginBottom: "12px" }}>{t("custom_detail")}</p>
              {route.map((b, idx) => {
                const isLast = idx === route.length - 1;
                const next = !isLast ? route[idx + 1] : null;
                const walk = next ? Math.max(2, Math.round(Math.sqrt((b.x - next.x) ** 2 + (b.y - next.y) ** 2) * 4)) : null;
                return (
                  <div key={b.id} style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", minWidth: "28px" }}>
                      <div style={{ width: "28px", height: "28px", borderRadius: "50%", backgroundColor: isLast ? C.coral : C.royal, border: `2px solid ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", marginTop: "2px", flexShrink: 0 }}>
                        {isLast ? <span style={{ fontSize: "12px" }}>🏁</span> : <span style={{ fontSize: "11px", fontWeight: 900, color: C.white }}>{idx + 1}</span>}
                      </div>
                      {!isLast && <div style={{ width: "2px", flex: 1, backgroundColor: C.pale, minHeight: "24px" }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "16px" }}>{b.emoji}</span>
                        <span style={{ fontSize: "14px", fontWeight: 800, color: C.navy }}>{t(b.nameKey)}</span>
                        <span style={{ backgroundColor: b.bg, border: `1.5px solid ${b.color}`, borderRadius: "6px", padding: "0 6px", fontSize: "10px", fontWeight: 800, color: b.color }}>{t(b.catKey)}</span>
                      </div>
                      {walk && (
                        <div style={{ display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
                          <div style={{ width: "10px", height: "1.5px", backgroundColor: C.pale }} />
                          <span style={{ fontSize: "11px", fontWeight: 600, color: "#4B6898" }}>{t("custom_walk", { n: walk })}</span>
                        </div>
                      )}
                    </div>
                    <IconPin size={12} color={b.color} />
                  </div>
                );
              })}
            </ComicCard>

            {/* Buttons */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
              <button
                onClick={() => navigate("/profile")}
                style={{ flex: 1, height: "50px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: C.royal, border: `2.5px solid ${C.navy}`, borderRadius: "14px", boxShadow: `4px 4px 0 ${C.navy}`, color: C.white, fontSize: "15px", fontWeight: 900, cursor: "pointer" }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
              >
                <IconPlay size={15} />
                {t("custom_start")}
              </button>
              <button
                onClick={() => route && toggleFavorite({
                  id: routeId, title: t("custom_my_route").replace("🧩 ", ""),
                  emoji: "🧩", type: "custom",
                  duration: t("custom_walk", { n: total }),
                  stops: route.map((b) => t(b.nameKey)),
                  bg: C.pale, tagBg: C.sky, tagLabel: t("type_custom"),
                })}
                style={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: fav ? "#FFF0F0" : C.white, border: `2.5px solid ${C.navy}`, borderRadius: "14px", boxShadow: `4px 4px 0 ${C.navy}`, cursor: "pointer" }}
                onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
              >
                <IconHeart size={20} filled={fav} color={C.coral} />
              </button>
            </div>
            <button
              onClick={handleReset}
              style={{ width: "100%", height: "44px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: C.white, border: `2px solid ${C.navy}`, borderRadius: "12px", boxShadow: `2px 2px 0 ${C.navy}`, color: C.navy, fontSize: "14px", fontWeight: 800, cursor: "pointer" }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
            >
              <IconReset size={16} />
              {t("custom_reselect")}
            </button>
          </div>
        )}
      </div>

      <BottomNav activeTab="Route" />
    </PhoneShell>
  );
}
