import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { PhoneShell, StatusBar, ComicCard, Burst, SpeechBubble } from "./PhoneShell";
import { BottomNav } from "./BottomNav";
import { useFavorites } from "../context/FavoritesContext";
import { useCamera } from "../context/CameraContext";
import { useLanguage } from "../context/LanguageContext";
import { STAMP_DEFS } from "../data/stamps";
import { classrooms } from "../data/classroomData";
import { SYSTEM_SCHOOL_COMMENTS, type SchoolPerspective } from "../data/schoolComments";
import {
  IconBell, IconHeart, IconStamp, IconSparkle,
  IconChevronRight, IconClock, IconPin, IconTrash, IconBack,
} from "./ComicIcons";

const C = {
  navy: "#0E1B4D", royal: "#2350D8", sky: "#4B9EF7", pale: "#A8D4FF",
  ice: "#DCF0FF", cream: "#FFFBF0", yellow: "#FFD93D", coral: "#FF6B6B",
  mint: "#5EEAA8", purple: "#7B5CF5", white: "#FFFFFF",
};

const navCardDefs = [
  { id: "pictures", labelKey: "home_nav_pictures", emoji: "🗺️", path: "/pictures",    bg: C.pale,      tagBg: C.sky,   tag: "MAPS"  },
  { id: "route",    labelKey: "home_nav_route",     emoji: "🧭", path: "/route",        bg: C.ice,       tagBg: C.royal, tag: "ROUTE" },
  { id: "mystery",  labelKey: "home_nav_mystery",   emoji: "🎲", path: "/mystery-route",bg: C.mint+"55", tagBg: C.purple,tag: "LUCKY" },
  { id: "custom",   labelKey: "home_nav_custom",    emoji: "🧩", path: "/custom-route", bg: C.cream,     tagBg: C.sky,   tag: "DIY"   },
];

type UserSchoolComment = {
  id: string;
  perspective: SchoolPerspective;
  text: string; // raw user input
  textLang: "zh" | "en";
  createdAt: number;
};

export function HomeScreen() {
  const navigate = useNavigate();
  const { favorites, removeFavorite } = useFavorites();
  const { stampCheckedCount, unlockedStampIds } = useCamera();
  const { lang, t } = useLanguage();
  const checkedCount = stampCheckedCount;

  const stampPreview = STAMP_DEFS.slice(0, 6).map((stamp) => ({
    ...stamp,
    checked: unlockedStampIds.includes(stamp.id),
  }));

  const typeLabel: Record<string, string> = {
    recommended: t("type_recommended"),
    mystery: t("type_mystery"),
    custom: t("type_custom"),
  };
  const typeColor: Record<string, string> = { recommended: C.sky, mystery: C.purple, custom: C.sky };

  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedRoom, setSelectedRoom] = useState<typeof classrooms[0] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const getLocale = (room: typeof classrooms[0]) => room[lang];

  const filtered = query.trim().length > 0
    ? classrooms.filter(
        (c) =>
          c.room.toLowerCase().includes(query.toLowerCase()) ||
          getLocale(c).building.toLowerCase().includes(query.toLowerCase())
      )
    : classrooms.slice(0, 6);

  useEffect(() => {
    if (showSearch && !selectedRoom) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [showSearch, selectedRoom]);

  const openSearch = () => { setShowSearch(true); setQuery(""); setSelectedRoom(null); };
  const closeSearch = () => { setShowSearch(false); setQuery(""); setSelectedRoom(null); };

  const USER_COMMENTS_KEY = "unibuddy_school_comments_v1";
  const [activePerspective, setActivePerspective] = useState<SchoolPerspective>("freshman");
  const [userComments, setUserComments] = useState<UserSchoolComment[]>([]);
  const [draftText, setDraftText] = useState("");
  const [isCommentsExpanded, setIsCommentsExpanded] = useState(true);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_COMMENTS_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return;

      // Lightweight validation (best-effort for older/invalid data)
      const safe = parsed
        .filter((c: any) => c && typeof c.id === "string" && (c.perspective === "freshman" || c.perspective === "visitor") && typeof c.text === "string")
        .map((c: any) => ({
          id: c.id as string,
          perspective: c.perspective as SchoolPerspective,
          text: c.text as string,
          textLang: (c.textLang === "en" ? "en" : "zh") as "zh" | "en",
          createdAt: typeof c.createdAt === "number" ? c.createdAt : Date.now(),
        })) as UserSchoolComment[];

      setUserComments(safe);
    } catch {
      // ignore storage errors
    }
  }, []);

  const formatCommentTime = (ts: number) => {
    try {
      const d = new Date(ts);
      return lang === "zh" ? d.toLocaleString("zh-CN") : d.toLocaleString("en-US");
    } catch {
      return "";
    }
  };

  const handlePostComment = () => {
    const text = draftText.trim();
    if (!text) return;

    const nextItem: UserSchoolComment = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      perspective: activePerspective,
      text,
      textLang: lang,
      createdAt: Date.now(),
    };

    setUserComments((prev) => {
      const next = [nextItem, ...prev];
      try {
        localStorage.setItem(USER_COMMENTS_KEY, JSON.stringify(next));
      } catch {
        // ignore
      }
      return next;
    });
    setDraftText("");
  };

  const userCommentsForFreshman = userComments.filter((c) => c.perspective === "freshman");
  const userCommentsForVisitor = userComments.filter((c) => c.perspective === "visitor");

  return (
    <PhoneShell bg={C.ice}>
      <StatusBar />

      {/* ── Header ── */}
      <div style={{ backgroundColor: C.royal, borderBottom: `3px solid ${C.navy}`, padding: "8px 20px 22px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #ffffff22 1.2px, transparent 1.2px)", backgroundSize: "14px 14px" }} />
        <div style={{ position: "absolute", top: "-30px", right: "-30px", width: "100px", height: "100px", borderRadius: "50%", backgroundColor: C.sky, border: `2px solid ${C.navy}`, opacity: 0.5 }} />
        <div style={{ position: "absolute", bottom: "-20px", left: "60px", width: "70px", height: "70px", borderRadius: "50%", backgroundColor: C.pale, border: `2px solid ${C.navy}`, opacity: 0.4 }} />

        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
            <div>
              <SpeechBubble style={{ marginBottom: "8px" }}>
                <span style={{ fontSize: "12px", fontWeight: 800, color: C.navy }}>{t("home_welcome")} 👋</span>
              </SpeechBubble>
              <h1 style={{ fontSize: "28px", fontWeight: 900, color: C.white, textShadow: `2px 2px 0 ${C.navy}`, marginTop: "14px" }}>
                UniBuddy
              </h1>
            </div>
            {/* Search button */}
            <button
              onClick={openSearch}
              style={{
                width: "40px", height: "40px",
                backgroundColor: C.white,
                border: `2px solid ${C.navy}`,
                borderRadius: "12px",
                boxShadow: `2px 2px 0 ${C.navy}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer",
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={C.navy} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M16.5 16.5L21 21" />
              </svg>
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: "flex", gap: "8px" }}>
            {[
              { labelKey: "home_spots",  value: "18",               bg: C.pale,   color: C.royal },
              { labelKey: "home_routes", value: "5",                bg: C.yellow, color: C.navy  },
              { labelKey: "home_stamps", value: `${checkedCount}`,  bg: C.mint,   color: C.navy  },
            ].map((s) => (
              <div key={s.labelKey} style={{ flex: 1, backgroundColor: s.bg, border: `2px solid ${C.navy}`, borderRadius: "12px", boxShadow: `2px 2px 0 ${C.navy}`, padding: "8px 0", textAlign: "center" }}>
                <p style={{ fontSize: "22px", fontWeight: 900, color: s.color, lineHeight: 1 }}>{s.value}</p>
                <p style={{ fontSize: "11px", fontWeight: 700, color: C.navy, marginTop: "2px" }}>{t(s.labelKey)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "120px" }}>

        <ComicCard style={{ padding: "14px", backgroundColor: C.cream, marginBottom: "18px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ fontSize: "26px", flexShrink: 0 }}>🏫</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 800, color: C.navy, marginBottom: "4px" }}>{t("home_about_title")}</p>
                <p style={{ fontSize: "12px", fontWeight: 500, color: "#4B6898", lineHeight: "1.6" }}>
                  {t("home_about_text")}
                </p>
              </div>
            </div>
          </ComicCard>

        <SectionLabel
          color={C.yellow}
          text={lang === "zh" ? "学校评论（全校视角）" : "School Comments (All Campus)"}
          icon={<IconBell size={18} />}
        />

        <ComicCard style={{ padding: "14px", backgroundColor: C.white, marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "10px", marginBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
              <span style={{ fontSize: "22px", lineHeight: 1, marginTop: "2px" }}>💬</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 900, color: C.navy, marginBottom: "3px" }}>
                  {lang === "zh" ? "新生视角 / 外来访客视角" : "Freshman / Visitor Perspectives"}
                </p>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898" }}>
                  {lang === "zh" ? "系统建议 + 你的补充" : "System suggestions + your notes"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsCommentsExpanded((prev) => !prev)}
              style={{
                flexShrink: 0,
                minWidth: "74px",
                height: "32px",
                padding: "0 10px",
                borderRadius: "10px",
                backgroundColor: C.ice,
                border: `2px solid ${C.navy}`,
                boxShadow: `2px 2px 0 ${C.navy}`,
                color: C.navy,
                fontSize: "11px",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {isCommentsExpanded
                ? (lang === "zh" ? "收起" : "Collapse")
                : (lang === "zh" ? "展开" : "Expand")}
            </button>
          </div>

          {isCommentsExpanded && (
            <>
              <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                <button
                  type="button"
                  onClick={() => setActivePerspective("freshman")}
                  style={{
                    flex: 1,
                    height: "36px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    backgroundColor: activePerspective === "freshman" ? C.royal : C.white,
                    color: activePerspective === "freshman" ? C.white : "#4B6898",
                    border: `2px solid ${C.navy}`,
                    boxShadow: activePerspective === "freshman" ? `3px 3px 0 ${C.navy}` : `2px 2px 0 ${C.pale}`,
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  🌱 {lang === "zh" ? "新生视角" : "Freshman"}
                </button>
                <button
                  type="button"
                  onClick={() => setActivePerspective("visitor")}
                  style={{
                    flex: 1,
                    height: "36px",
                    borderRadius: "12px",
                    cursor: "pointer",
                    backgroundColor: activePerspective === "visitor" ? C.royal : C.white,
                    color: activePerspective === "visitor" ? C.white : "#4B6898",
                    border: `2px solid ${C.navy}`,
                    boxShadow: activePerspective === "visitor" ? `3px 3px 0 ${C.navy}` : `2px 2px 0 ${C.pale}`,
                    fontSize: "12px",
                    fontWeight: 900,
                  }}
                >
                  🌍 {lang === "zh" ? "外来访客视角" : "Visitor"}
                </button>
              </div>

              <div style={{ backgroundColor: "#F8FCFF", border: `1.5px solid ${C.pale}`, borderRadius: "14px", padding: "10px", marginBottom: "12px" }}>
                <textarea
                  value={draftText}
                  onChange={(e) => setDraftText(e.target.value)}
                  rows={3}
                  placeholder={lang === "zh" ? "写下你的看法（按上方视角发布）" : "Write your thoughts (post under the selected perspective)"}
                  style={{
                    width: "100%",
                    backgroundColor: C.white,
                    border: `2.5px solid ${C.navy}`,
                    borderRadius: "12px",
                    padding: "10px 10px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: C.navy,
                    outline: "none",
                    resize: "none",
                    boxSizing: "border-box",
                  }}
                />

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "10px", gap: "10px" }}>
                  <p style={{ fontSize: "11px", fontWeight: 800, color: "#4B6898", margin: 0 }}>
                    {lang === "zh" ? "发布后会展示在该视角下" : "Your comment will appear under this perspective"}
                  </p>
                  <button
                    type="button"
                    onClick={handlePostComment}
                    disabled={!draftText.trim()}
                    style={{
                      height: "34px",
                      padding: "0 14px",
                      borderRadius: "12px",
                      cursor: !draftText.trim() ? "not-allowed" : "pointer",
                      backgroundColor: !draftText.trim() ? "#B7C7E9" : C.royal,
                      border: `2px solid ${C.navy}`,
                      boxShadow: !draftText.trim() ? "none" : `2px 2px 0 ${C.navy}`,
                      color: C.white,
                      fontSize: "12px",
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {lang === "zh" ? "发布" : "Post"}
                  </button>
                </div>
              </div>

              <div style={{ borderTop: `2px solid ${C.pale}`, paddingTop: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(["freshman", "visitor"] as const).map((p) => {
                    const systemList = SYSTEM_SCHOOL_COMMENTS[p];
                    const allUserList = p === "freshman" ? userCommentsForFreshman : userCommentsForVisitor;
                    const userList = allUserList.filter((c) => c.textLang === lang);
                    const titleZh = p === "freshman" ? "新生视角" : "外来访客视角";
                    const titleEn = p === "freshman" ? "Freshman" : "Visitor";
                    return (
                      <div
                        key={p}
                        style={{
                          backgroundColor: "#F8FCFF",
                          border: `1.5px solid ${C.pale}`,
                          borderRadius: "14px",
                          padding: "10px",
                        }}
                      >
                        <p style={{ fontSize: "12px", fontWeight: 900, color: C.navy, marginBottom: "8px" }}>
                          {p === "freshman" ? "🌱" : "🌍"} {lang === "zh" ? titleZh : titleEn}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", maxHeight: "160px", overflowY: "auto", paddingRight: "4px" }}>
                          <p style={{ fontSize: "11px", fontWeight: 900, color: "#4B6898", marginBottom: "-2px" }}>
                            {lang === "zh" ? "系统评论" : "System comments"}
                          </p>
                          {systemList.map((c, idx) => (
                            <div
                              key={`sys-${p}-${idx}`}
                              style={{ backgroundColor: C.ice, border: `1.5px solid ${C.pale}`, borderRadius: "12px", padding: "10px" }}
                            >
                              <p style={{ fontSize: "12px", fontWeight: 900, color: C.navy, marginBottom: 0 }}>
                                {lang === "zh" ? c.zh : c.en}
                              </p>
                            </div>
                          ))}

                          <p style={{ fontSize: "11px", fontWeight: 900, color: "#4B6898", marginTop: "2px", marginBottom: "-2px" }}>
                            {lang === "zh" ? `你的评论（${userList.length}）` : `Your notes (${userList.length})`}
                          </p>

                          {userList.length === 0 ? (
                            <div style={{ backgroundColor: C.cream, border: `1.5px dashed ${C.pale}`, borderRadius: "12px", padding: "10px" }}>
                              <p style={{ fontSize: "11px", fontWeight: 800, color: "#4B6898", marginBottom: 0 }}>
                                {lang === "zh" ? "当前语言下还没有评论，快来补充吧！" : "No comments in this language yet—be the first to add one."}
                              </p>
                            </div>
                          ) : (
                            userList.map((c) => (
                              <div key={c.id} style={{ backgroundColor: "#FFF0F0", border: `1.5px solid ${C.coral}`, borderRadius: "12px", padding: "10px" }}>
                                <p style={{ fontSize: "12px", fontWeight: 900, color: C.navy, marginBottom: "4px" }}>
                                  {c.text}
                                </p>
                                <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", marginBottom: 0 }}>
                                  {formatCommentTime(c.createdAt)}
                                </p>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </ComicCard>

        <SectionLabel color={C.yellow} text={t("home_nav")} icon={<IconSparkle size={18} />} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
          {navCardDefs.map((card) => (
            <button
              key={card.id}
              onClick={() => navigate(card.path)}
              style={{ backgroundColor: card.bg, border: `2.5px solid ${C.navy}`, borderRadius: "16px", boxShadow: `4px 4px 0 ${C.navy}`, padding: "14px 12px", textAlign: "left", cursor: "pointer", display: "flex", flexDirection: "column", gap: "6px", minHeight: "108px" }}
              onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
              onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
            >
              <div style={{ display: "inline-block", backgroundColor: card.tagBg, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "1px 7px", fontSize: "10px", fontWeight: 900, color: C.white, letterSpacing: "0.5px", alignSelf: "flex-start" }}>
                {card.tag}
              </div>
              <span style={{ fontSize: "30px" }}>{card.emoji}</span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t(card.labelKey)}</span>
            </button>
          ))}
        </div>

        <SectionLabel color={C.sky} text={t("home_stamp_section")} icon={<IconStamp size={18} filled />} />

        <ComicCard style={{ padding: "14px", marginBottom: "6px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("home_stamp_label")}</span>
            <span style={{ fontSize: "13px", fontWeight: 900, color: C.royal }}>{checkedCount} / {STAMP_DEFS.length}</span>
          </div>
          <div style={{ width: "100%", height: "12px", backgroundColor: C.ice, border: `2px solid ${C.navy}`, borderRadius: "20px", overflow: "hidden", marginBottom: "12px" }}>
            <div style={{ height: "100%", backgroundColor: C.royal, width: `${(checkedCount / STAMP_DEFS.length) * 100}%`, borderRight: checkedCount < STAMP_DEFS.length ? `2px solid ${C.navy}` : "none" }} />
          </div>
          <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
            {stampPreview.map((stamp) => (
              <div key={stamp.id} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                <div style={{ width: "38px", height: "38px", border: stamp.checked ? `2px solid ${C.royal}` : `2px dashed ${C.pale}`, borderRadius: "10px", boxShadow: stamp.checked ? `2px 2px 0 ${C.royal}` : "none", overflow: "hidden", opacity: stamp.checked ? 1 : 0.3, backgroundColor: C.white }}>
                  <img
                    src={`${import.meta.env.BASE_URL}${stamp.imagePath}`}
                    alt={`stamp-preview-${stamp.id}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate("/profile")}
            style={{ width: "100%", marginTop: "12px", height: "36px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", backgroundColor: C.ice, border: `2px solid ${C.navy}`, borderRadius: "10px", boxShadow: `2px 2px 0 ${C.navy}`, fontSize: "12px", fontWeight: 800, color: C.navy, cursor: "pointer" }}
          >
            {t("home_stamp_view")} <IconChevronRight size={14} />
          </button>
        </ComicCard>

        <div style={{ marginTop: "18px" }}>
          <SectionLabel color={C.coral} text={t("home_favs")} icon={<IconHeart size={18} filled color={C.coral} />} />
          {favorites.length === 0 ? (
            <ComicCard style={{ padding: "20px", textAlign: "center", backgroundColor: C.cream }}>
              <span style={{ fontSize: "32px", display: "block", marginBottom: "8px" }}>💫</span>
              <p style={{ fontSize: "13px", fontWeight: 700, color: "#4B6898" }}>{t("home_no_favs")}</p>
              <p style={{ fontSize: "12px", fontWeight: 500, color: "#94A3B8", marginTop: "4px" }}>{t("home_no_favs_sub")}</p>
              <button onClick={() => navigate("/route")} style={{ marginTop: "12px", padding: "6px 18px", backgroundColor: C.royal, border: `2px solid ${C.navy}`, borderRadius: "10px", boxShadow: `2px 2px 0 ${C.navy}`, color: C.white, fontSize: "12px", fontWeight: 800, cursor: "pointer" }}>
                {t("home_explore")}
              </button>
            </ComicCard>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {favorites.map((fav) => (
                <ComicCard key={fav.id} style={{ padding: "14px", backgroundColor: fav.bg || C.pale }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "48px", height: "48px", backgroundColor: C.white, border: `2.5px solid ${C.navy}`, borderRadius: "14px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", flexShrink: 0 }}>
                      {fav.emoji}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "14px", fontWeight: 900, color: C.navy }}>{fav.title}</span>
                        <span style={{ backgroundColor: typeColor[fav.type] || C.sky, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "0 6px", fontSize: "10px", fontWeight: 900, color: C.white }}>
                          {typeLabel[fav.type] || fav.type}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        {fav.duration && (
                          <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                            <IconClock size={12} color={C.royal} />
                            <span style={{ fontSize: "11px", fontWeight: 700, color: C.royal }}>{fav.duration}</span>
                          </div>
                        )}
                        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <IconPin size={12} color={C.royal} />
                          <span style={{ fontSize: "11px", fontWeight: 700, color: C.royal }}>{fav.stops.length} {t("route_stops")}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexShrink: 0 }}>
                      <button onClick={() => navigate("/route")} style={{ width: "32px", height: "32px", backgroundColor: C.royal, border: `2px solid ${C.navy}`, borderRadius: "8px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M6 4L20 12L6 20V4Z" fill="white" /></svg>
                      </button>
                      <button onClick={() => removeFavorite(fav.id)} style={{ width: "32px", height: "32px", backgroundColor: C.white, border: `2px solid ${C.navy}`, borderRadius: "8px", boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                        <IconTrash size={15} />
                      </button>
                    </div>
                  </div>
                </ComicCard>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav activeTab="Home" />

      {/* ── Search Overlay ── */}
      {showSearch && (
        <div style={{ position: "absolute", inset: 0, zIndex: 50, backgroundColor: C.ice, display: "flex", flexDirection: "column" }}>

          {selectedRoom ? (
            /* ── Navigation Detail View ── */
            <>
              {/* Nav header */}
              <div style={{ backgroundColor: C.royal, borderBottom: `3px solid ${C.navy}`, padding: "10px 16px 20px", flexShrink: 0, position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "80px", height: "80px", borderRadius: "50%", backgroundColor: C.sky, opacity: 0.3 }} />
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px", position: "relative", zIndex: 1 }}>
                  <button
                    onClick={() => setSelectedRoom(null)}
                    style={{ width: "34px", height: "34px", backgroundColor: "rgba(255,255,255,0.2)", border: `2px solid rgba(255,255,255,0.4)`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                  >
                    <IconBack size={18} color="white" />
                  </button>
                  <div>
                    <p style={{ fontSize: "11px", fontWeight: 700, color: "rgba(255,255,255,0.7)" }}>{t("home_classroom_nav")}</p>
                    <p style={{ fontSize: "20px", fontWeight: 900, color: C.white, textShadow: `1px 1px 0 ${C.navy}` }}>
                      {selectedRoom.room}
                    </p>
                  </div>
                  <div style={{ marginLeft: "auto" }}>
                    <Burst size={44} color={C.yellow} text={getLocale(selectedRoom).duration} textColor={C.navy} />
                  </div>
                </div>
                <div style={{ position: "relative", zIndex: 1, display: "flex", gap: "6px" }}>
                  <span style={{ backgroundColor: C.pale, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 800, color: C.navy }}>
                    {getLocale(selectedRoom).building}
                  </span>
                  <span style={{ backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "2px 8px", fontSize: "11px", fontWeight: 800, color: C.navy }}>
                    {t("home_floor", { n: selectedRoom.floor })}
                  </span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-4 pt-4" style={{ paddingBottom: "24px" }}>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <div style={{ width: "4px", height: "18px", backgroundColor: C.royal, border: `1.5px solid ${C.navy}`, borderRadius: "2px" }} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("home_walk")}</span>
                </div>

                <ComicCard style={{ padding: "14px", marginBottom: "14px", backgroundColor: C.cream }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {getLocale(selectedRoom).steps.map((step, i) => (
                      <div key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                          <div style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            backgroundColor: i === 0 ? C.mint : i === getLocale(selectedRoom).steps.length - 1 ? C.royal : C.pale,
                            border: `2px solid ${C.navy}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "13px", fontWeight: 900,
                            color: i === getLocale(selectedRoom).steps.length - 1 ? C.white : C.navy,
                          }}>
                            {i === 0 ? "📍" : i === getLocale(selectedRoom).steps.length - 1 ? "🏛️" : `${i}`}
                          </div>
                          {i < getLocale(selectedRoom).steps.length - 1 && (
                            <div style={{ width: "2px", height: "24px", backgroundColor: C.pale, margin: "3px 0" }} />
                          )}
                        </div>
                        <div style={{ paddingTop: "4px", paddingBottom: i < getLocale(selectedRoom).steps.length - 1 ? "8px" : "0" }}>
                          <p style={{ fontSize: "13px", fontWeight: i === 0 || i === getLocale(selectedRoom).steps.length - 1 ? 800 : 600, color: C.navy }}>
                            {step.replace(/^[^\s]+\s/, "")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </ComicCard>

                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                  <div style={{ width: "4px", height: "18px", backgroundColor: C.yellow, border: `1.5px solid ${C.navy}`, borderRadius: "2px" }} />
                  <span style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{t("home_floor_nav")}</span>
                </div>

                <ComicCard style={{ padding: "14px", marginBottom: "12px", backgroundColor: selectedRoom.access === "elevator" ? C.pale : selectedRoom.access === "stairs" ? "#E8D5FF" : C.mint + "55" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "46px", height: "46px", flexShrink: 0,
                      backgroundColor: C.white, border: `2.5px solid ${C.navy}`,
                      borderRadius: "14px", boxShadow: `3px 3px 0 ${C.navy}`,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px",
                    }}>
                      {selectedRoom.access === "elevator" ? "🛗" : selectedRoom.access === "stairs" ? "🪜" : "🚶"}
                    </div>
                    <div>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898" }}>
                        {selectedRoom.access === "elevator" ? t("home_elev") : selectedRoom.access === "stairs" ? t("home_stairs") : t("home_no_elev")}
                      </p>
                      <p style={{ fontSize: "13px", fontWeight: 800, color: C.navy }}>{getLocale(selectedRoom).accessDetail}</p>
                    </div>
                  </div>
                </ComicCard>

                <ComicCard style={{ padding: "14px", backgroundColor: C.ice }}>
                  <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "22px", flexShrink: 0 }}>📌</span>
                    <div>
                      <p style={{ fontSize: "12px", fontWeight: 700, color: "#4B6898", marginBottom: "4px" }}>{t("home_arrive")}</p>
                      <p style={{ fontSize: "13px", fontWeight: 800, color: C.navy, lineHeight: 1.5 }}>{getLocale(selectedRoom).floorGuide}</p>
                    </div>
                  </div>
                </ComicCard>

                <button
                  onClick={closeSearch}
                  style={{ width: "100%", marginTop: "16px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: C.royal, border: `2.5px solid ${C.navy}`, borderRadius: "14px", boxShadow: `4px 4px 0 ${C.navy}`, color: C.white, fontSize: "15px", fontWeight: 900, cursor: "pointer" }}
                  onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                  onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
                >
                  {t("home_start_nav")}
                </button>
              </div>
            </>
          ) : (
            /* ── Search Panel ── */
            <>
              {/* Search header */}
              <div style={{ backgroundColor: C.royal, borderBottom: `3px solid ${C.navy}`, padding: "10px 16px 16px", flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                  <button
                    onClick={closeSearch}
                    style={{ width: "34px", height: "34px", backgroundColor: "rgba(255,255,255,0.2)", border: `2px solid rgba(255,255,255,0.4)`, borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", flexShrink: 0 }}
                  >
                    <IconBack size={18} color="white" />
                  </button>
                  <p style={{ fontSize: "18px", fontWeight: 900, color: C.white, textShadow: `1px 1px 0 ${C.navy}` }}>{t("home_search_title")}</p>
                </div>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4B6898" strokeWidth="2.5" strokeLinecap="round">
                      <circle cx="11" cy="11" r="7" /><path d="M16.5 16.5L21 21" />
                    </svg>
                  </div>
                  <input
                    ref={inputRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t("home_search_ph")}
                    style={{
                      width: "100%", height: "44px",
                      backgroundColor: C.white, border: `2.5px solid ${C.navy}`,
                      borderRadius: "14px", boxShadow: `3px 3px 0 ${C.navy}`,
                      paddingLeft: "36px", paddingRight: "12px",
                      fontSize: "13px", fontWeight: 600, color: C.navy,
                      outline: "none", boxSizing: "border-box",
                    }}
                  />
                  {query && (
                    <button
                      onClick={() => setQuery("")}
                      style={{ position: "absolute", right: "10px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#94A3B8" }}
                    >✕</button>
                  )}
                </div>
              </div>

              {/* Results */}
              <div className="flex-1 overflow-y-auto px-4 pt-3" style={{ paddingBottom: "20px" }}>
                {query.trim() === "" && (
                  <p style={{ fontSize: "11px", fontWeight: 700, color: "#94A3B8", marginBottom: "10px" }}>
                    {t("home_search_hint")}
                  </p>
                )}
                {filtered.length === 0 ? (
                  <ComicCard style={{ padding: "24px", textAlign: "center", backgroundColor: C.cream }}>
                    <span style={{ fontSize: "36px", display: "block", marginBottom: "8px" }}>🔍</span>
                    <p style={{ fontSize: "14px", fontWeight: 800, color: C.navy }}>{t("home_not_found")}</p>
                    <p style={{ fontSize: "12px", fontWeight: 500, color: "#4B6898", marginTop: "4px" }}>{t("home_not_found_sub")}</p>
                  </ComicCard>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {filtered.map((room) => (
                      <button
                        key={room.id}
                        onClick={() => setSelectedRoom(room)}
                        style={{
                          display: "flex", alignItems: "center", gap: "12px",
                          backgroundColor: C.white, border: `2.5px solid ${C.navy}`,
                          borderRadius: "14px", boxShadow: `3px 3px 0 ${C.navy}`,
                          padding: "12px 14px", cursor: "pointer", textAlign: "left", width: "100%",
                        }}
                        onMouseDown={(e) => (e.currentTarget.style.transform = "translate(2px,2px)")}
                        onMouseUp={(e) => (e.currentTarget.style.transform = "translate(0,0)")}
                      >
                        <div style={{ width: "44px", height: "44px", backgroundColor: C.pale, border: `2px solid ${C.navy}`, borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "22px", flexShrink: 0 }}>
                          🏛️
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "3px" }}>
                            <span style={{ fontSize: "15px", fontWeight: 900, color: C.navy }}>{room.room}</span>
                            <span style={{ backgroundColor: C.sky, border: `1.5px solid ${C.navy}`, borderRadius: "6px", padding: "0 6px", fontSize: "10px", fontWeight: 900, color: C.white }}>{t("home_floor", { n: room.floor })}</span>
                          </div>
                          <p style={{ fontSize: "12px", fontWeight: 600, color: "#4B6898" }}>{getLocale(room).building}</p>
                          <p style={{ fontSize: "11px", fontWeight: 700, color: C.royal, marginTop: "2px" }}>⏱ {getLocale(room).duration}</p>
                        </div>
                        <IconChevronRight size={16} color={C.navy} />
                      </button>
                    ))}
                    {query.trim() === "" && (
                      <p style={{ textAlign: "center", fontSize: "11px", fontWeight: 600, color: "#94A3B8", marginTop: "4px" }}>
                        {t("home_more_rooms")}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </PhoneShell>
  );
}

function SectionLabel({ color, text, icon }: { color: string; text: string; icon?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
      <div style={{ width: "4px", height: "18px", backgroundColor: color, border: "1.5px solid #0E1B4D", borderRadius: "2px" }} />
      <span style={{ fontSize: "13px", fontWeight: 800, color: "#0E1B4D" }}>{text}</span>
      {icon}
    </div>
  );
}
