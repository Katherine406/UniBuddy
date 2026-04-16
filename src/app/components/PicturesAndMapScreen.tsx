import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { PhoneShell, StatusBar, ComicCard, Burst } from "./PhoneShell";
import { BottomNav } from "./BottomNav";
import { IconBack, IconChevronLeft, IconChevronRight, IconPin, IconNavigation, IconChevronRight as IconArrow } from "./ComicIcons";
import { useLanguage } from "../context/LanguageContext";
import { classrooms } from "../data/classroomData";

const C = {
  navy: "#0E1B4D", royal: "#2350D8", sky: "#4B9EF7", pale: "#A8D4FF",
  ice: "#DCF0FF", cream: "#FFFBF0", yellow: "#FFD93D", coral: "#FF6B6B",
  mint: "#5EEAA8", purple: "#7B5CF5", white: "#FFFFFF",
};

const photoDefs = [
  { id: 1, titleKey: "photo_square",   tagKey: "tag_square"   },
  { id: 2, titleKey: "photo_library",  tagKey: "tag_academic" },
  { id: 3, titleKey: "photo_path",     tagKey: "tag_nature"   },
  { id: 4, titleKey: "photo_teaching", tagKey: "tag_building" },
  { id: 5, titleKey: "photo_sports",   tagKey: "tag_sports"   },
];

const mapPinDefs = [
  { id: 1, labelKey: "pin_library",  x: 38, y: 28, color: C.royal  },
  { id: 2, labelKey: "pin_square",   x: 55, y: 46, color: C.sky    },
  { id: 3, labelKey: "pin_teaching", x: 24, y: 55, color: C.purple },
  { id: 4, labelKey: "pin_canteen",  x: 70, y: 60, color: C.coral  },
  { id: 5, labelKey: "pin_gym",      x: 48, y: 72, color: C.mint   },
];

type MapTabKey = "map" | "live";

export function PicturesAndMapScreen() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [cur, setCur] = useState(0);
  const [mapTab, setMapTab] = useState<MapTabKey>("map");

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<typeof classrooms[0] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Route planning states
  const [routePlanning, setRoutePlanning] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const routeSectionRef = useRef<HTMLDivElement>(null);

  // Reset route state whenever a different room is selected
  useEffect(() => {
    setRoutePlanning(false);
    setRouteReady(false);
  }, [selected]);

  const handlePlanRoute = () => {
    if (routePlanning || routeReady) return;
    setRoutePlanning(true);
    setTimeout(() => {
      setRoutePlanning(false);
      setRouteReady(true);
      setTimeout(() => {
        routeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }, 1800);
  };

  const getLocale = (room: typeof classrooms[0]) => room[lang];

  const filtered = query.trim().length > 0
    ? classrooms.filter(
        (c) =>
          c.room.toLowerCase().includes(query.toLowerCase()) ||
          getLocale(c).building.toLowerCase().includes(query.toLowerCase())
      )
    : classrooms.slice(0, 5);

  const prev = () => setCur((c) => (c - 1 + photoDefs.length) % photoDefs.length);
  const next = () => setCur((c) => (c + 1) % photoDefs.length);

  const mapTabs: { key: MapTabKey; label: string }[] = [
    { key: "map",  label: t("map_tab_map")  },
    { key: "live", label: t("map_tab_live") },
  ];

  return (
    <PhoneShell bg={C.ice}>
      <StatusBar />

      {/* Header */}
      <div style={{ backgroundColor: C.sky, borderBottom: `3px solid ${C.navy}`, padding: "8px 20px 22px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff22 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
        <div style={{ position: "absolute", bottom: "8px", right: "20px" }}><Burst size={44} color={C.yellow} text="📸" /></div>

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "rgba(255,255,255,0.8)" }}>UniBuddy</span>
          </div>
          <h1 style={{ fontSize: "26px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}` }}>📸 {t("map_title")}</h1>
          <p style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.85)", marginTop: "2px" }}>{t("map_subtitle")}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "120px" }}>

        {/* ── Gallery ── */}
        <SectionLabel color={C.yellow} text={t("map_photos")} />

        <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", height: "192px", border: `2.5px solid ${C.navy}`, boxShadow: `4px 4px 0 ${C.navy}`, marginBottom: "10px" }}>
          {/* Placeholder: replace with <img> when photo is ready */}
          <div style={{ width: "100%", height: "100%", backgroundColor: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="3" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#CBD5E1" }}>{t(photoDefs[cur].titleKey)}</span>
          </div>
          <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: C.yellow, border: `2px solid ${C.navy}`, borderRadius: "8px", padding: "2px 8px", fontSize: "11px", fontWeight: 900, color: C.navy, boxShadow: `2px 2px 0 ${C.navy}` }}>
            {t(photoDefs[cur].tagKey)}
          </div>
          <div style={{ position: "absolute", bottom: "0", left: "0", right: "0", padding: "10px 14px", background: "linear-gradient(transparent, rgba(14,27,77,0.55))" }}>
            <span style={{ fontSize: "14px", fontWeight: 800, color: C.white }}>{t(photoDefs[cur].titleKey)}</span>
          </div>
          <button onClick={prev} style={{ position: "absolute", left: "8px", top: "50%", transform: "translateY(-50%)", width: "30px", height: "30px", backgroundColor: C.white, border: `2px solid ${C.navy}`, borderRadius: "8px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <IconChevronLeft size={16} />
          </button>
          <button onClick={next} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", width: "30px", height: "30px", backgroundColor: C.white, border: `2px solid ${C.navy}`, borderRadius: "8px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
            <IconChevronRight size={16} />
          </button>
        </div>

        {/* Thumbnails */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
          {photoDefs.map((p, i) => (
            <button key={p.id} onClick={() => setCur(i)} style={{ flex: 1, height: "48px", borderRadius: "10px", overflow: "hidden", border: i === cur ? `2.5px solid ${C.navy}` : `2px solid ${C.pale}`, opacity: i === cur ? 1 : 0.55, boxShadow: i === cur ? `2px 2px 0 ${C.navy}` : "none", cursor: "pointer", padding: 0, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {/* Placeholder thumbnail */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
          ))}
        </div>

        {/* Dots */}
        <div style={{ display: "flex", justifyContent: "center", gap: "6px", marginBottom: "16px" }}>
          {photoDefs.map((_, i) => (
            <button key={i} onClick={() => setCur(i)} style={{ width: i === cur ? "22px" : "8px", height: "8px", borderRadius: "20px", backgroundColor: i === cur ? C.royal : C.pale, border: `1.5px solid ${C.navy}`, transition: "width 0.2s", cursor: "pointer" }} />
          ))}
        </div>

        {/* ── Map ── */}
        <SectionLabel color={C.sky} text={t("map_map")} />

        <div style={{ display: "flex", gap: "6px", marginBottom: "10px" }}>
          {mapTabs.map((tab) => (
            <button key={tab.key} onClick={() => setMapTab(tab.key)} style={{ flex: 1, height: "38px", borderRadius: "12px", cursor: "pointer", backgroundColor: mapTab === tab.key ? C.royal : C.white, color: mapTab === tab.key ? C.white : "#4B6898", border: `2.5px solid ${C.navy}`, boxShadow: mapTab === tab.key ? `3px 3px 0 ${C.navy}` : `2px 2px 0 ${C.pale}`, fontSize: "13px", fontWeight: 800 }}>
              {tab.label}
            </button>
          ))}
        </div>

        <ComicCard style={{ height: "200px", overflow: "hidden", position: "relative", backgroundColor: C.ice, marginBottom: "18px" }}>
          <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }} viewBox="0 0 390 200" preserveAspectRatio="none">
            <line x1="50" y1="0" x2="50" y2="200" stroke={C.pale} strokeWidth="10" />
            <line x1="340" y1="0" x2="340" y2="200" stroke={C.pale} strokeWidth="10" />
            <line x1="0" y1="50" x2="390" y2="50" stroke={C.pale} strokeWidth="10" />
            <line x1="0" y1="160" x2="390" y2="160" stroke={C.pale} strokeWidth="10" />
            <line x1="50" y1="0" x2="50" y2="200" stroke={C.navy} strokeWidth="1.5" strokeDasharray="4,4" />
            <line x1="340" y1="0" x2="340" y2="200" stroke={C.navy} strokeWidth="1.5" strokeDasharray="4,4" />
            <line x1="0" y1="50" x2="390" y2="50" stroke={C.navy} strokeWidth="1.5" strokeDasharray="4,4" />
            <line x1="0" y1="160" x2="390" y2="160" stroke={C.navy} strokeWidth="1.5" strokeDasharray="4,4" />
            <rect x="64" y="62" width="262" height="87" rx="12" fill={C.white} stroke={C.navy} strokeWidth="2" />
            <rect x="78" y="74" width="54" height="32" rx="6" fill={C.pale} stroke={C.navy} strokeWidth="1.5" />
            <rect x="156" y="68" width="74" height="42" rx="6" fill={C.sky} stroke={C.navy} strokeWidth="1.5" opacity="0.7" />
            <rect x="254" y="78" width="56" height="28" rx="6" fill={C.pale} stroke={C.navy} strokeWidth="1.5" />
            <rect x="96" y="116" width="38" height="26" rx="6" fill={C.mint} stroke={C.navy} strokeWidth="1.5" opacity="0.7" />
            <rect x="210" y="112" width="48" height="30" rx="6" fill={C.yellow} stroke={C.navy} strokeWidth="1.5" opacity="0.7" />
            <path d="M195 62 L195 148" stroke={C.navy} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4,4" />
            <path d="M64 105 L326 105" stroke={C.navy} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="4,4" />
          </svg>
          {mapPinDefs.map((pin) => (
            <div key={pin.id} style={{ position: "absolute", left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%,-100%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <div style={{ width: "22px", height: "22px", borderRadius: "50%", backgroundColor: pin.color, border: `2px solid ${C.navy}`, boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconPin size={11} color="white" />
              </div>
              <div style={{ backgroundColor: C.white, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "1px 6px", marginTop: "2px", fontSize: "9px", fontWeight: 800, color: pin.color, whiteSpace: "nowrap", boxShadow: `1px 1px 0 ${C.navy}` }}>
                {t(pin.labelKey)}
              </div>
            </div>
          ))}
          {mapTab === "live" && (
            <div style={{ position: "absolute", inset: 0, backgroundColor: `${C.royal}22`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "10px" }}>
              <div style={{ width: "56px", height: "56px", backgroundColor: C.white, border: `3px solid ${C.royal}`, boxShadow: `3px 3px 0 ${C.navy}`, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", animation: "pulse 1.2s ease-in-out infinite alternate" }}>
                <IconNavigation size={24} color={C.royal} />
              </div>
              <div style={{ backgroundColor: C.royal, border: `2px solid ${C.navy}`, borderRadius: "20px", padding: "4px 14px", fontSize: "12px", fontWeight: 800, color: C.white, boxShadow: `2px 2px 0 ${C.navy}` }}>
                {t("map_locating")}
              </div>
              <style>{`@keyframes pulse { from { transform: scale(1); } to { transform: scale(1.1); } }`}</style>
            </div>
          )}
        </ComicCard>

        {/* ── Classroom Search Section ── */}
        <SectionLabel color={C.coral} text={t("map_search")} />

        {/* Search bar */}
        <div style={{ position: "relative", marginBottom: "10px" }}>
          <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", zIndex: 1 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#4B6898" strokeWidth="2.5" strokeLinecap="round">
              
            </svg>
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("map_search_ph")}
            style={{
              width: "100%", height: "46px",
              backgroundColor: C.white,
              border: `2.5px solid ${C.navy}`,
              borderRadius: "14px",
              boxShadow: `3px 3px 0 ${C.navy}`,
              paddingLeft: "36px", paddingRight: query ? "36px" : "14px",
              fontSize: "13px", fontWeight: 600, color: C.navy,
              outline: "none", boxSizing: "border-box",
            }}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "15px", color: "#94A3B8", padding: "4px" }}
            >✕</button>
          )}
        </div>

        {/* Hint */}
        {query.trim() === "" && (
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "8px" }}>
            {t("map_hint")}
          </p>
        )}

        {/* Results list */}
        {filtered.length === 0 ? (
          <ComicCard style={{ padding: "20px", textAlign: "center", backgroundColor: C.cream }}>
            <span style={{ fontSize: "32px", display: "block", marginBottom: "6px" }}>🔍</span>
            <p style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("map_not_found")}</p>
            <p style={{ fontSize: "11px", fontWeight: 500, color: "#4B6898", marginTop: "4px" }}>{t("map_not_found_sub")}</p>
          </ComicCard>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filtered.map((room) => {
              const locale = getLocale(room);
              return (
                <button
                  key={room.id}
                  onClick={() => setSelected(room)}
                  style={{
                    display: "flex", alignItems: "center", gap: "12px",
                    backgroundColor: C.white, border: `2.5px solid ${C.navy}`,
                    borderRadius: "14px", boxShadow: `3px 3px 0 ${C.navy}`,
                    padding: "10px 12px", cursor: "pointer", textAlign: "left", width: "100%",
                  }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
                >
                  <div style={{ width: "40px", height: "40px", backgroundColor: C.pale, border: `2px solid ${C.navy}`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
                    🏛️
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "2px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 900, color: C.navy }}>{room.room}</span>
                      <span style={{ backgroundColor: C.sky, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "0 6px", fontSize: "10px", fontWeight: 900, color: C.white }}>{t("map_floor", { n: room.floor })}</span>
                      <span style={{ backgroundColor: room.access === "elevator" ? C.pale : room.access === "stairs" ? "#E8D5FF" : C.mint + "88", border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "0 6px", fontSize: "10px", fontWeight: 800, color: C.navy }}>
                        {room.access === "elevator" ? t("acc_elev_tag") : room.access === "stairs" ? t("acc_stairs_tag") : t("acc_direct_tag")}
                      </span>
                    </div>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "#4B6898" }}>{locale.building}</p>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: C.royal, marginTop: "1px" }}>⏱ {locale.duration}</p>
                  </div>
                  <IconArrow size={15} color={C.navy} />
                </button>
              );
            })}
            {query.trim() === "" && (
              <p style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#94A3B8", paddingBottom: "4px" }}>
                {t(" ")}
              </p>
            )}
          </div>
        )}
      </div>

      <BottomNav activeTab="Map" />

      {/* ── Navigation Detail Overlay ── */}
      {selected && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, backgroundColor: C.ice, display: "flex", flexDirection: "column" }}>
          {(() => {
            const locale = getLocale(selected);
            return (
              <>
                {/* Nav header */}
                <div style={{ backgroundColor: C.royal, borderBottom: `3px solid ${C.navy}`, padding: "10px 16px 20px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff18 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
                  <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: C.sky, opacity: 0.3 }} />
                  <div style={{ position: "relative", zIndex: 1, display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                    {/* Back button */}
                    <button
                      onClick={() => setSelected(null)}
                      style={{ width: "34px", height: "34px", flexShrink: 0, backgroundColor: "rgba(255,255,255,0.15)", border: "2px solid rgba(255,255,255,0.4)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
                      onMouseDown={(e) => (e.currentTarget.style.transform = "translate(1px,1px)")}
                      onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
                    >
                      <IconBack size={16} color={C.white} />
                    </button>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{t("home_classroom_nav")}</p>
                      <p style={{ fontSize: "20px", fontWeight: 900, color: C.white, textShadow: `1px 1px 0 ${C.navy}` }}>{selected.room}</p>
                    </div>
                    <div style={{ marginLeft: "auto" }}>
                      <Burst size={44} color={C.yellow} text={locale.duration} textColor={C.navy} />
                    </div>
                  </div>
                  <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "6px" }}>
                    <span style={{ backgroundColor: C.pale, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 800, color: C.navy }}>{locale.building}</span>
                    <span style={{ backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 800, color: C.navy }}>{t("map_floor", { n: selected.floor })}</span>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "24px" }}>

                  {/* Walk route */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ width: "4px", height: "18px", backgroundColor: C.royal, border: `1.5px solid ${C.navy}`, borderRadius: "2px" }} />
                    <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("map_walk")}</span>
                  </div>

                  <ComicCard style={{ padding: "14px", marginBottom: "14px", backgroundColor: C.cream }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {locale.steps.map((step, i) => (
                        <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                            <div style={{
                              width: "28px", height: "28px", borderRadius: "50%",
                              backgroundColor: i === 0 ? C.mint : i === locale.steps.length - 1 ? C.royal : C.pale,
                              border: `2px solid ${C.navy}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "13px", fontWeight: 900,
                              color: i === locale.steps.length - 1 ? C.white : C.navy,
                            }}>
                              {i === 0 ? "📍" : i === locale.steps.length - 1 ? "🏛️" : `${i}`}
                            </div>
                            {i < locale.steps.length - 1 && (
                              <div style={{ width: "2px", height: "24px", backgroundColor: C.pale, margin: "3px 0" }} />
                            )}
                          </div>
                          <div style={{ paddingTop: "4px", paddingBottom: i < locale.steps.length - 1 ? "8px" : "0" }}>
                            <p style={{ fontSize: "13px", fontWeight: i === 0 || i === locale.steps.length - 1 ? 800 : 600, color: C.navy }}>
                              {step.replace(/^[^\s]+\s/, "")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ComicCard>

                  {/* Floor guide */}
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                    <div style={{ width: "4px", height: "18px", backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "2px" }} />
                    <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("map_floor_nav")}</span>
                  </div>

                  {/* Access card */}
                  <ComicCard style={{ padding: "14px", marginBottom: "12px", backgroundColor: selected.access === "elevator" ? C.pale : selected.access === "stairs" ? "#E8D5FF" : C.mint + "55" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "46px", height: "46px", flexShrink: 0, backgroundColor: C.white, border: `2.5px solid ${C.navy}`, borderRadius: "14px", boxShadow: `3px 3px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>
                        {selected.access === "elevator" ? "🛗" : selected.access === "stairs" ? "🪜" : "🚶"}
                      </div>
                      <div>
                        <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898" }}>
                          {selected.access === "elevator" ? t("map_elev") : selected.access === "stairs" ? t("map_stairs") : t("map_no_elev")}
                        </p>
                        <p style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{locale.accessDetail}</p>
                      </div>
                    </div>
                  </ComicCard>

                  {/* Room guide */}
                  <ComicCard style={{ padding: "14px", backgroundColor: C.ice }}>
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <span style={{ fontSize: "22px", flexShrink: 0 }}>📌</span>
                      <div>
                        <p style={{ fontSize: "12px", fontWeight: 700, color: "#4B6898", marginBottom: "4px" }}>{t("map_arrive")}</p>
                        <p style={{ fontSize: "13px", fontWeight: 800, color: C.navy, lineHeight: 1.5 }}>{locale.floorGuide}</p>
                      </div>
                    </div>
                  </ComicCard>

                  <button
                    onClick={handlePlanRoute}
                    disabled={routePlanning || routeReady}
                    style={{
                      width: "100%", marginTop: "16px", height: "50px",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: "8px",
                      backgroundColor: routeReady ? C.mint : routePlanning ? C.sky : C.royal,
                      border: `2.5px solid ${C.navy}`,
                      borderRadius: "14px",
                      boxShadow: routePlanning || routeReady ? "none" : `4px 4px 0 ${C.navy}`,
                      color: routeReady ? C.navy : C.white,
                      fontSize: "15px", fontWeight: 900, cursor: routePlanning || routeReady ? "default" : "pointer",
                      transition: "background-color 0.3s",
                      transform: routePlanning || routeReady ? "translate(2px,2px)" : undefined,
                    }}
                    onMouseDown={(e) => { if (!routePlanning && !routeReady) e.currentTarget.style.transform = "translate(2px,2px)"; }}
                    onMouseUp={(e) => { if (!routePlanning && !routeReady) e.currentTarget.style.transform = "translate(0,0)"; }}
                  >
                    {routePlanning && (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite", flexShrink: 0 }}>
                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                      </svg>
                    )}
                    {routePlanning ? t("nav_planning") : routeReady ? t("nav_route_ready_btn") : t("map_done")}
                  </button>

                  {/* ── Route Planning Section (revealed after button click) ── */}
                  {routeReady && (
                    <div ref={routeSectionRef} style={{ marginTop: "24px" }}>
                      {/* Section header */}
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                        <div style={{ width: "4px", height: "18px", backgroundColor: C.mint, border: `1.5px solid ${C.navy}`, borderRadius: "2px" }} />
                        <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>🗺️ {t("nav_plan_route")}</span>
                        <span style={{ marginLeft: "auto", backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "1px 8px", fontSize: "9px", fontWeight: 900, color: C.navy, letterSpacing: "0.5px" }}>DEMO</span>
                      </div>

                      {/* Mock navigation map */}
                      <ComicCard style={{ padding: 0, overflow: "hidden", marginBottom: "10px" }}>
                        {/* Map canvas */}
                        <div style={{ position: "relative", height: "170px", backgroundColor: "#D8EEFF" }}>
                          <svg
                            style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
                            viewBox="0 0 320 170"
                            preserveAspectRatio="none"
                          >
                            {/* Background */}
                            <rect x="0" y="0" width="320" height="170" fill="#D8EEFF" />

                            {/* Road network */}
                            <line x1="0" y1="57" x2="320" y2="57" stroke="#B9DBF5" strokeWidth="14" />
                            <line x1="0" y1="113" x2="320" y2="113" stroke="#B9DBF5" strokeWidth="14" />
                            <line x1="80" y1="0" x2="80" y2="170" stroke="#B9DBF5" strokeWidth="11" />
                            <line x1="240" y1="0" x2="240" y2="170" stroke="#B9DBF5" strokeWidth="11" />

                            {/* Road center lines */}
                            <line x1="0" y1="57" x2="320" y2="57" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="8,6" opacity="0.6" />
                            <line x1="0" y1="113" x2="320" y2="113" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="8,6" opacity="0.6" />
                            <line x1="80" y1="0" x2="80" y2="170" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="8,6" opacity="0.6" />
                            <line x1="240" y1="0" x2="240" y2="170" stroke="#ffffff" strokeWidth="1.5" strokeDasharray="8,6" opacity="0.6" />

                            {/* City blocks */}
                            <rect x="8" y="8" width="64" height="42" rx="6" fill="#C0D8EF" stroke="#92B8D4" strokeWidth="1" />
                            <rect x="90" y="8" width="142" height="42" rx="6" fill="#C0D8EF" stroke="#92B8D4" strokeWidth="1" />
                            <rect x="250" y="8" width="62" height="42" rx="6" fill="#C0D8EF" stroke="#92B8D4" strokeWidth="1" />
                            <rect x="8" y="68" width="64" height="38" rx="6" fill="#C0D8EF" stroke="#92B8D4" strokeWidth="1" />
                            {/* You-are-here block (highlighted) */}
                            <rect x="90" y="68" width="64" height="38" rx="6" fill="#A8FFD4" stroke="#0E1B4D" strokeWidth="2" />
                            <rect x="166" y="68" width="66" height="38" rx="6" fill="#C0D8EF" stroke="#92B8D4" strokeWidth="1" />
                            <rect x="250" y="68" width="62" height="38" rx="6" fill="#C0D8EF" stroke="#92B8D4" strokeWidth="1" />
                            <rect x="8" y="122" width="64" height="40" rx="6" fill="#C0D8EF" stroke="#92B8D4" strokeWidth="1" />
                            <rect x="90" y="122" width="142" height="40" rx="6" fill="#C0D8EF" stroke="#92B8D4" strokeWidth="1" />
                            {/* Destination block (highlighted) */}
                            <rect x="250" y="122" width="62" height="40" rx="6" fill="#FFD93D" stroke="#0E1B4D" strokeWidth="2" />

                            {/* Route path: from you-here (122,87) → road → right turn → destination (281,142) */}
                            {/* Shadow glow */}
                            <path
                              d="M122 87 L240 87 L240 142 L281 142"
                              stroke="#4B9EF7"
                              strokeWidth="6"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              fill="none"
                              opacity="0.35"
                            />
                            {/* Main route line */}
                            <path
                              d="M122 87 L240 87 L240 142 L281 142"
                              stroke="#2350D8"
                              strokeWidth="3.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeDasharray="7,5"
                              fill="none"
                            />
                            {/* Direction arrow at mid-path */}
                            <polygon points="200,84 207,87 200,90" fill="#2350D8" />
                            <polygon points="243,125 240,132 237,125" fill="#2350D8" />
                          </svg>

                          {/* "You are here" marker */}
                          <div style={{
                            position: "absolute",
                            left: "38%",
                            top: "50%",
                            transform: "translate(-50%, -100%) translateY(-4px)",
                            display: "flex", flexDirection: "column", alignItems: "center",
                          }}>
                            <div style={{
                              width: "26px", height: "26px", borderRadius: "50%",
                              backgroundColor: C.mint, border: `2.5px solid ${C.navy}`,
                              boxShadow: `2px 2px 0 ${C.navy}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "12px",
                            }}>📍</div>
                            <div style={{
                              backgroundColor: C.white, border: `1.5px solid ${C.navy}`,
                              borderRadius: "6px", padding: "2px 6px", marginTop: "3px",
                              fontSize: "8px", fontWeight: 800, color: C.navy,
                              whiteSpace: "nowrap", boxShadow: `1.5px 1.5px 0 ${C.navy}`,
                            }}>{t("nav_your_loc")}</div>
                          </div>

                          {/* Destination marker */}
                          <div style={{
                            position: "absolute",
                            right: "6%",
                            bottom: "18px",
                            transform: "translateX(50%)",
                            display: "flex", flexDirection: "column", alignItems: "center",
                          }}>
                            <div style={{
                              width: "26px", height: "26px", borderRadius: "50%",
                              backgroundColor: C.coral, border: `2.5px solid ${C.navy}`,
                              boxShadow: `2px 2px 0 ${C.navy}`,
                              display: "flex", alignItems: "center", justifyContent: "center",
                              fontSize: "12px",
                            }}>🏛️</div>
                            <div style={{
                              backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`,
                              borderRadius: "6px", padding: "2px 6px", marginTop: "3px",
                              fontSize: "8px", fontWeight: 900, color: C.navy,
                              whiteSpace: "nowrap", boxShadow: `1.5px 1.5px 0 ${C.navy}`,
                            }}>{selected.room}</div>
                          </div>
                        </div>

                        {/* Route stats bar */}
                        <div style={{
                          padding: "10px 16px",
                          backgroundColor: C.white,
                          borderTop: `2px solid ${C.navy}`,
                          display: "flex", alignItems: "center", gap: "0",
                        }}>
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <p style={{ fontSize: "9px", fontWeight: 700, color: "#4B6898", marginBottom: "2px" }}>{t("nav_est_walk")}</p>
                            <p style={{ fontSize: "15px", fontWeight: 900, color: C.royal }}>{locale.duration}</p>
                          </div>
                          <div style={{ width: "1px", height: "30px", backgroundColor: C.pale, margin: "0 8px" }} />
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <p style={{ fontSize: "9px", fontWeight: 700, color: "#4B6898", marginBottom: "2px" }}>{t("nav_distance")}</p>
                            <p style={{ fontSize: "15px", fontWeight: 900, color: C.navy }}>~350m</p>
                          </div>
                          <div style={{ width: "1px", height: "30px", backgroundColor: C.pale, margin: "0 8px" }} />
                          <div style={{ flex: 1, textAlign: "center" }}>
                            <div style={{
                              display: "inline-block",
                              backgroundColor: C.pale, border: `1.5px solid ${C.navy}`,
                              borderRadius: "8px", padding: "3px 8px",
                              fontSize: "9px", fontWeight: 800, color: C.navy,
                            }}>{t("nav_walking")}</div>
                          </div>
                        </div>
                      </ComicCard>

                      {/* GPS coming-soon note */}
                      <ComicCard style={{
                        padding: "12px 14px",
                        backgroundColor: `${C.purple}12`,
                        border: `2px dashed ${C.purple}55`,
                        boxShadow: "none",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: "4px",
                      }}>
                        <p style={{ fontSize: "11px", fontWeight: 800, color: C.purple, textAlign: "center" }}>
                          🛰️ {t("nav_gps_coming")}
                        </p>
                        <p style={{ fontSize: "10px", fontWeight: 600, color: "#4B6898", textAlign: "center" }}>
                          {t("nav_route_hint")}
                        </p>
                      </ComicCard>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </PhoneShell>
  );
}

function SectionLabel({ color, text }: { color: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
      <div style={{ width: "4px", height: "18px", backgroundColor: color, border: "1.5px solid #0E1B4D", borderRadius: "2px" }} />
      <span style={{ fontSize: "13px", fontWeight: 800, color: "#0E1B4D" }}>{text}</span>
    </div>
  );
}