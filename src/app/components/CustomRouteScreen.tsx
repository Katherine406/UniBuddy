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
  id: string;
  label: string;
  fullName: string;
  emoji: string;
  catKey: string;
  color: string;
  bg: string;
  x: number;
  y: number;
}

const FIXED_START_ID = "cb";

// 自定义路线的“地标选择”，改为使用地图里已标注出来的点（与 `PicturesAndMapScreen` 的 pin 对齐）。
// x/y 使用地图百分比坐标后会重新缩放到一个较小的网格，用于保持距离/时间计算的观感合理。
const campusMapHotspots = [
  { id: "ls", label: "LS", fullName: "Life Sciences", x: 32, y: 22, color: "#2d8f47" },
  { id: "fb", label: "FB", fullName: "Foundation Building", x: 41, y: 42, color: "#5ba3d4" },
  { id: "cb", label: "CB", fullName: "Central Building", x: 42, y: 56, color: "#17316f" },
  { id: "sa", label: "SA", fullName: "Science Building A", x: 54, y: 51, color: "#6abf69" },
  { id: "sb", label: "SB", fullName: "Science Building B", x: 54, y: 55, color: "#6abf69" },
  { id: "sc", label: "SC", fullName: "Science Building C", x: 54, y: 59, color: "#6abf69" },
  { id: "sd", label: "SD", fullName: "Science Building D", x: 54, y: 63, color: "#6abf69" },
  { id: "pb", label: "PB", fullName: "Public Building", x: 61, y: 53, color: "#e8a23a" },
  { id: "ma", label: "MA", fullName: "Mathematics Building A", x: 67, y: 53, color: "#7e57c2" },
  { id: "mb", label: "MB", fullName: "Mathematics Building B", x: 67, y: 57, color: "#7e57c2" },
  { id: "ee", label: "EE", fullName: "Electrical & Electronic", x: 61, y: 63, color: "#26a69a" },
  { id: "eb", label: "EB", fullName: "Engineering Building", x: 68, y: 61, color: "#3d8f5a" },
  { id: "ir", label: "IR", fullName: "International Research Centre", x: 54, y: 73, color: "#c62828" },
  { id: "ia", label: "IA", fullName: "International Academic Exchange", x: 63, y: 75, color: "#ef6c2a" },
  { id: "hs", label: "HS", fullName: "Humanities & Social Sciences", x: 63, y: 83, color: "#8d6e63" },
  { id: "es", label: "ES", fullName: "Emerging Sciences", x: 53, y: 92, color: "#d84315" },
  { id: "db", label: "DB", fullName: "Design Building", x: 65, y: 90, color: "#795548" },
  { id: "bs", label: "BS", fullName: "International Business School", x: 51, y: 83, color: "#c62828" },
  { id: "as", label: "AS", fullName: "Film & Creative Technology", x: 45, y: 71, color: "#f9a825" },
  { id: "gym", label: "GYM", fullName: "Gymnasium", x: 73, y: 75, color: "#263238" },
] as const;

type CampusMapHotspot = (typeof campusMapHotspots)[number];

const pinMinX = Math.min(...campusMapHotspots.map((p) => p.x));
const pinMaxX = Math.max(...campusMapHotspots.map((p) => p.x));
const pinMinY = Math.min(...campusMapHotspots.map((p) => p.y));
const pinMaxY = Math.max(...campusMapHotspots.map((p) => p.y));

const xRange = pinMaxX - pinMinX || 1;
const yRange = pinMaxY - pinMinY || 1;

const scaleX = (x: number) => ((x - pinMinX) / xRange) * 8; // 原来的自定义网格大约 0..8
const scaleY = (y: number) => ((y - pinMinY) / yRange) * 6; // 原来的自定义网格大约 0..6

function emojiForPin(id: string): string {
  if (id === "gym") return "🏟️";
  if (id === "fb") return "🏛️";
  if (id === "cb") return "📍";
  if (id === "pb") return "🧪";
  if (id === "as") return "🎬";
  if (id === "ir") return "🔬";
  if (id === "db") return "🏠";
  return "🏢";
}

const buildingDefs: BuildingDef[] = [...campusMapHotspots]
  // 保证起点在 selectedBuildings 的第一位，从而让距离规划从固定起点开始
  .sort((a: CampusMapHotspot, b: CampusMapHotspot) => {
    if (a.id === FIXED_START_ID) return -1;
    if (b.id === FIXED_START_ID) return 1;
    return 0;
  })
  .map((pin: CampusMapHotspot) => {
    const isSports = pin.id === "gym";
    return {
      id: pin.id,
      label: pin.label,
      fullName: pin.fullName,
      emoji: emojiForPin(pin.id),
      catKey: isSports ? "cat_sports" : "cat_academic",
      color: pin.color,
      bg: isSports ? C.yellow : C.ice,
      x: scaleX(pin.x),
      y: scaleY(pin.y),
    };
  });

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
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set([FIXED_START_ID]));
  const [activeCatKey, setActiveCatKey] = useState("cat_all");
  const [phase, setPhase] = useState<Phase>("select");
  const [route, setRoute] = useState<BuildingDef[] | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (id: string) => {
    if (id === FIXED_START_ID) return;
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
  const handleReset = () => { setSelectedIds(new Set([FIXED_START_ID])); setRoute(null); setPhase("select"); };

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
                  <button key={b.id} onClick={() => toggle(b.id)} style={{ backgroundColor: b.bg, border: `2px solid ${b.color}`, borderRadius: "20px", padding: "2px 10px", display: "flex", alignItems: "center", gap: "4px", cursor: "pointer", boxShadow: `2px 2px 0 ${b.id === FIXED_START_ID ? "#aaa" : b.color}` }}>
                    <span style={{ fontSize: "12px" }}>{b.emoji}</span>
                    <span style={{ fontSize: "11px", fontWeight: 800, color: b.color }}>{b.label}</span>
                    {b.id !== FIXED_START_ID && <span style={{ fontSize: "13px", fontWeight: 900, color: b.color, lineHeight: 1 }}>×</span>}
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
                const isFixed = b.id === FIXED_START_ID;
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
                    <span style={{ fontSize: "11px", fontWeight: 800, color: isSel ? b.color : C.navy, textAlign: "center" }}>{b.label}</span>
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
                        <span style={{ fontSize: "14px", fontWeight: 800, color: C.navy }}>{b.label}</span>
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
                  stops: route.map((b) => b.label),
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
