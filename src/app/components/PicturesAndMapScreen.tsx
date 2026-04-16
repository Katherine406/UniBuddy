import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import * as L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
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

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const photoDefs = [
  { id: 1, titleKey: "photo_square",   tagKey: "tag_square",   fileName: "Square.jpg"   },
  { id: 2, titleKey: "photo_library",  tagKey: "tag_academic", fileName: "Academic.jpg" },
  { id: 3, titleKey: "photo_path",     tagKey: "tag_nature",   fileName: "Nature.jpg"   },
  { id: 4, titleKey: "photo_teaching", tagKey: "tag_building", fileName: "Building.jpg" },
  { id: 5, titleKey: "photo_sports",   tagKey: "tag_sports",   fileName: "Sports.jpg"   },
];

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

type MapTabKey = "map" | "live";
type CampusConvenienceItem = { titleKey: string; icon: string; locationsKey: string };

const campusConvenienceItems: CampusConvenienceItem[] = [
  {
    titleKey: "map_convenience_sanitary",
    icon: "🧴",
    locationsKey: "map_convenience_sanitary_locs",
  },
  {
    titleKey: "map_convenience_umbrella",
    icon: "☂️",
    locationsKey: "map_convenience_umbrella_locs",
  },
  {
    titleKey: "map_convenience_smoking",
    icon: "🚬",
    locationsKey: "map_convenience_smoking_locs",
  },
];

interface CampusLocationInfo {
  type: string;
  title: string;
  subtitle: string;
  desc: string;
  story: string;
  tags: string[];
  bestFor: string;
  access: string;
}

const campusLocationInfo: Record<string, CampusLocationInfo> = {
  ls: {
    type: "📍 North campus",
    title: "Life Sciences Building",
    subtitle: "Life Sciences",
    desc: "A seven-storey hub for industry-integrated education, combining authentic industrial scenarios with immersive virtual teaching environments.",
    story: "The LS building is divided into the north building and the south building. LSS is the south building and LSN is the north building.",
    tags: ["Lab", "North Campus", "Science"],
    bestFor: "STEM labs · research visits",
    access: "Verify lifts and ramps on site",
  },
  fb: {
    type: "📍 Central campus",
    title: "Foundation Building",
    subtitle: "Foundation Building",
    desc: "A core facility supporting undergraduate general education and foundational discipline teaching, and a major venue for EAP classes.",
    story: "FB offers many small classrooms and open discussion areas. The ground floor also houses a convenience store and a Subway.",
    tags: ["Teaching", "Core Courses", "Landmark"],
    bestFor: "New students · core courses",
    access: "Verify lifts and ramps on site",
  },
  cb: {
    type: "📍 Landmark",
    title: "Central Building",
    subtitle: "Central Building",
    desc: "As the campus core functional zone, it brings together career development services, academic support, and student leisure.",
    story: "The library floors provide study desks, and the building includes key student services such as counselling, IT helpdesk, career center, and one-stop service.",
    tags: ["Iconic", "Campus Story", "Photo Spot"],
    bestFor: "All visitors · main story stop",
    access: "Lifts and ramps—verify on site",
  },
  sa: {
    type: "📍 Science cluster",
    title: "Science Building A",
    subtitle: "Science A",
    desc: "Primarily accommodates the School of Science while providing laboratories, offices, and lecture theatres for multi-disciplinary use.",
    story: "For rooms on the first floor, the west entrance (facing CB) is more direct. The east entrance leads directly to elevators.",
    tags: ["Science", "Cluster A"],
    bestFor: "STEM classes",
    access: "Verify on site",
  },
  sb: {
    type: "📍 Science cluster",
    title: "Science Building B",
    subtitle: "Science B",
    desc: "Primarily accommodates the School of Science while providing laboratories, offices, and lecture theatres for multi-disciplinary use.",
    story: "For first-floor rooms, the east entrance (facing North Foundation) is more direct. The west entrance leads to elevators.",
    tags: ["Science", "Cluster B"],
    bestFor: "Labs and seminars",
    access: "Verify on site",
  },
  sc: {
    type: "📍 Science cluster",
    title: "Science Building C",
    subtitle: "Science C",
    desc: "Primarily accommodates the School of Science while providing laboratories, offices, and lecture theatres for multi-disciplinary use.",
    story: "For first-floor rooms, enter from the west side facing CB. The east entrance connects more directly to elevators.",
    tags: ["Science", "Cluster C"],
    bestFor: "Group work · study hops",
    access: "Verify on site",
  },
  sd: {
    type: "📍 Science cluster",
    title: "Science Building D",
    subtitle: "Science D",
    desc: "Primarily accommodates the School of Science while providing laboratories, offices, and lecture theatres for multi-disciplinary use.",
    story: "For first-floor rooms, the east entrance (towards North Foundation) is usually easier. The west entrance leads to elevators.",
    tags: ["Science", "Cluster D"],
    bestFor: "Moving between clusters",
    access: "Verify on site",
  },
  pb: {
    type: "📍 Public services",
    title: "Public Building",
    subtitle: "Public Building",
    desc: "Functions as a central academic facility featuring large-capacity lecture theatres, classrooms, offices, and meeting rooms.",
    story: "The entrance is located on the east side, adjacent to the shop.",
    tags: ["Public", "Events", "Services"],
    bestFor: "Guests · event info",
    access: "Verify on site",
  },
  ma: {
    type: "📍 Mathematics",
    title: "Mathematics Building A",
    subtitle: "Mathematics A",
    desc: "Contains offices, classrooms, and lecture theatres, primarily supporting the School of Mathematics and Physics.",
    story: "MA and MB are interconnected, allowing access to the other building from every floor.",
    tags: ["Math", "Academic"],
    bestFor: "Math and statistics",
    access: "Verify on site",
  },
  mb: {
    type: "📍 Mathematics",
    title: "Mathematics Building B",
    subtitle: "Mathematics B",
    desc: "Contains offices, classrooms, and lecture theatres, primarily supporting the School of Mathematics and Physics.",
    story: "MA and MB are interconnected, allowing access to the other building from every floor.",
    tags: ["Math", "Academic"],
    bestFor: "Seminars · office hours",
    access: "Verify on site",
  },
  ee: {
    type: "📍 Engineering",
    title: "Electrical & Electronic Engineering",
    subtitle: "EEE Building",
    desc: "Features engineering laboratories, classrooms, and lecture halls, serving as a primary facility for the School of Advanced Technology.",
    story: "EE and EB are connected. Transit to the adjacent building is available on specific floors.",
    tags: ["EEE", "Lab", "Innovation"],
    bestFor: "Engineering visits · lab tours",
    access: "Lab areas may need booking—verify",
  },
  eb: {
    type: "📍 Engineering",
    title: "Engineering Building",
    subtitle: "Engineering Building",
    desc: "Provides classrooms and lecture theatres alongside specialized studios for Civil Engineering and Industrial Design.",
    story: "EE and EB are connected. Transit to the adjacent building is available on specific floors.",
    tags: ["Engineering", "Project-based"],
    bestFor: "Project studios · workshops",
    access: "Verify on site",
  },
  ir: {
    type: "📍 South Campus",
    title: "International Research Centre",
    subtitle: "International Research Centre",
    desc: "A functional building for scientific cooperation and international exchange, often used by research groups and visiting scholars.",
    story: "The entrance is located on the east-south side, near the right side of the underground passage.",
    tags: ["Research", "International"],
    bestFor: "Academic visits and activity discussions",
    access: "All floors",
  },
  ia: {
    type: "📍 South Campus",
    title: "International Academic Exchange & Collaboration Centre",
    subtitle: "International Academic Exchange",
    desc: "An important venue for hosting conferences, receptions, and cross-cultural academic activities.",
    story: "The entrance is located on the west-south side, near the left side of the underground passage.",
    tags: ["Conference", "Bilingual", "Guests"],
    bestFor: "International visitor & conference reception",
    access: "All floors",
  },
  hs: {
    type: "📍 South Campus",
    title: "Humanities & Social Sciences Building",
    subtitle: "Humanities & Social Sciences",
    desc: "A key humanities teaching area with seminar-style spaces and social science learning support.",
    story: "This area often hosts reading clubs and debate activities.",
    tags: ["Humanities", "Seminar", "Culture"],
    bestFor: "Humanities courses",
    access: "All floors",
  },
  es: {
    type: "📍 South Campus",
    title: "Emerging & Interdisciplinary Sciences Building",
    subtitle: "Emerging & Interdisciplinary Science",
    desc: "An interdisciplinary exploration space emphasizing cross-disciplinary collaboration.",
    story: "The entrance is located on the east-north side.",
    tags: ["Interdisciplinary", "Future"],
    bestFor: "Environmental and interdisciplinary majors",
    access: "All floors",
  },
  db: {
    type: "📍 South Campus",
    title: "Design Building",
    subtitle: "Design Building",
    desc: "Workshops, exhibition areas, and review spaces for design-major students.",
    story: "The entrance is on the west-north side, behind HS.",
    tags: ["Design", "Studio", "Exhibition"],
    bestFor: "Design majors & exhibitions",
    access: "Studio areas follow department rules",
  },
  bs: {
    type: "📍 South Campus",
    title: "International Business School Suzhou",
    subtitle: "IBSS at XJTLU",
    desc: "A key building for business education and case teaching, connecting industry practice with international curricula.",
    story: "Main entrance is on the east side; north and south entries are also available.",
    tags: ["Business", "Case Study", "Career"],
    bestFor: "Business students & career exploration",
    access: "All floors",
  },
  as: {
    type: "📍 South Campus",
    title: "Film & Creative Technology",
    subtitle: "Film and Creative Technology Building",
    desc: "A practical teaching space integrating film, creativity, and technology for media-related majors.",
    story: "The entrance is located on the east-south side, behind IR.",
    tags: ["Media", "Creative", "Studio"],
    bestFor: "Film, TV, and creative courses",
    access: "Most floors open; some rooms may be closed",
  },
  gym: {
    type: "🎮 South Campus",
    title: "Gymnasium",
    subtitle: "GYM",
    desc: "A large indoor sports and event venue, supporting campus sports culture and collective activities.",
    story: "Entrances are available on both west and east sides.",
    tags: ["Sports", "Events", "Wellness"],
    bestFor: "Sports and event viewing",
    access: "By appointment",
  },
};

const campusLocationInfoZh: Record<string, CampusLocationInfo> = {
  ls: {
    type: "📍 北校区",
    title: "生命科学楼",
    subtitle: "生命科学楼",
    desc: "一座七层教学与科研综合楼，融合真实产业场景与沉浸式虚拟教学环境。",
    story: "LS 由南北两栋组成，LSS 为南楼，LSN 为北楼。",
    tags: ["实验室", "北校区", "科学"],
    bestFor: "理工实验课 · 科研参访",
    access: "无障碍通行请以现场设施为准",
  },
  fb: {
    type: "📍 校园中心",
    title: "基础楼",
    subtitle: "基础楼",
    desc: "本科通识与基础课程的重要教学楼，也是 EAP 课程主要上课地点之一。",
    story: "FB 内有大量小教室与开放讨论区，一层设有便利店与 Subway。",
    tags: ["教学", "基础课程", "地标"],
    bestFor: "新生 · 基础课",
    access: "无障碍通行请以现场设施为准",
  },
  cb: {
    type: "📍 地标建筑",
    title: "中央楼",
    subtitle: "中央楼",
    desc: "校园核心功能区，汇集学习支持、职业发展与学生服务资源。",
    story: "图书馆楼层提供自习空间，楼内还有心理咨询、IT 帮助台、就业中心等服务。",
    tags: ["地标", "校园故事", "拍照点"],
    bestFor: "所有来访者 · 校园主线打卡",
    access: "设有电梯与坡道，细节以现场为准",
  },
  sa: {
    type: "📍 理科组团",
    title: "理科楼 A",
    subtitle: "理科楼 A",
    desc: "主要服务理学院教学与科研，配置实验室、办公室及阶梯教室。",
    story: "一层教室建议从西门（朝向 CB）进入更近，东门可直达电梯。",
    tags: ["理科", "A 组团"],
    bestFor: "理工课程",
    access: "通行信息请以现场为准",
  },
  sb: {
    type: "📍 理科组团",
    title: "理科楼 B",
    subtitle: "理科楼 B",
    desc: "主要服务理学院教学与科研，配置实验室、办公室及阶梯教室。",
    story: "去一层教室从东门（朝向北校区基础楼）更方便，西门更靠近电梯。",
    tags: ["理科", "B 组团"],
    bestFor: "实验课与研讨课",
    access: "通行信息请以现场为准",
  },
  sc: {
    type: "📍 理科组团",
    title: "理科楼 C",
    subtitle: "理科楼 C",
    desc: "主要服务理学院教学与科研，配置实验室、办公室及阶梯教室。",
    story: "一层教室建议从西侧（朝 CB）进入，东侧入口更靠近电梯。",
    tags: ["理科", "C 组团"],
    bestFor: "小组学习 · 教学穿梭",
    access: "通行信息请以现场为准",
  },
  sd: {
    type: "📍 理科组团",
    title: "理科楼 D",
    subtitle: "理科楼 D",
    desc: "主要服务理学院教学与科研，配置实验室、办公室及阶梯教室。",
    story: "一层教室通常从东门（朝北基础楼）更便捷，西门可到电梯。",
    tags: ["理科", "D 组团"],
    bestFor: "组团之间快速通行",
    access: "通行信息请以现场为准",
  },
  pb: {
    type: "📍 公共服务区",
    title: "公共楼",
    subtitle: "公共楼",
    desc: "校园公共教学核心设施，设有大教室、普通教室、办公室与会议空间。",
    story: "主要入口位于东侧，临近商店区域。",
    tags: ["公共", "活动", "服务"],
    bestFor: "访客 · 活动信息",
    access: "通行信息请以现场为准",
  },
  ma: {
    type: "📍 数学组团",
    title: "数学楼 A",
    subtitle: "数学楼 A",
    desc: "包含办公室、教室与阶梯教室，主要服务数学与物理相关教学。",
    story: "MA 与 MB 楼层互通，可在各层前往相邻楼栋。",
    tags: ["数学", "学术"],
    bestFor: "数学与统计课程",
    access: "通行信息请以现场为准",
  },
  mb: {
    type: "📍 数学组团",
    title: "数学楼 B",
    subtitle: "数学楼 B",
    desc: "包含办公室、教室与阶梯教室，主要服务数学与物理相关教学。",
    story: "MA 与 MB 楼层互通，可在各层前往相邻楼栋。",
    tags: ["数学", "学术"],
    bestFor: "研讨课 · 答疑时段",
    access: "通行信息请以现场为准",
  },
  ee: {
    type: "📍 工程组团",
    title: "电气与电子工程楼",
    subtitle: "EEE 楼",
    desc: "配备工程实验室、教室与报告厅，是先进技术学院的重要教学楼。",
    story: "EE 与 EB 在部分楼层连通，可在楼内换楼。",
    tags: ["电子电气", "实验", "创新"],
    bestFor: "工程参访 · 实验课",
    access: "部分实验区需预约，请以现场安排为准",
  },
  eb: {
    type: "📍 工程组团",
    title: "工程楼",
    subtitle: "工程楼",
    desc: "提供教室与阶梯教室，同时设有土木工程与工业设计专业空间。",
    story: "EE 与 EB 在部分楼层互通，可在楼内换楼。",
    tags: ["工程", "项目制"],
    bestFor: "项目课程 · 工作坊",
    access: "通行信息请以现场为准",
  },
  ir: {
    type: "📍 南校区",
    title: "国际科研中心",
    subtitle: "国际科研中心",
    desc: "面向科研合作与国际交流的综合功能楼，常用于研究团队与学术访问活动。",
    story: "入口位于东南侧，靠近地下通道右侧。",
    tags: ["科研", "国际"],
    bestFor: "学术参访与交流",
    access: "全楼层可达",
  },
  ia: {
    type: "📍 南校区",
    title: "国际学术交流与协作中心",
    subtitle: "国际学术交流中心",
    desc: "举办会议、接待与跨文化学术活动的重要场地。",
    story: "入口位于西南侧，靠近地下通道左侧。",
    tags: ["会议", "双语", "接待"],
    bestFor: "国际访客与会议接待",
    access: "全楼层可达",
  },
  hs: {
    type: "📍 南校区",
    title: "人文与社会科学楼",
    subtitle: "人文社科楼",
    desc: "人文类教学与讨论空间集中区域，支持研讨式课堂与社科学习。",
    story: "这里常举办读书会、辩论与人文活动。",
    tags: ["人文", "研讨", "文化"],
    bestFor: "人文社科课程",
    access: "全楼层可达",
  },
  es: {
    type: "📍 南校区",
    title: "新兴与交叉科学楼",
    subtitle: "新兴交叉科学楼",
    desc: "强调跨学科协作与创新探索的教学科研空间。",
    story: "入口位于建筑东北侧。",
    tags: ["交叉学科", "未来方向"],
    bestFor: "环境与交叉学科专业",
    access: "全楼层可达",
  },
  db: {
    type: "📍 南校区",
    title: "设计楼",
    subtitle: "设计楼",
    desc: "提供设计专业所需的工作坊、展示区与评图空间。",
    story: "入口位于西北侧，靠近 HS 后方。",
    tags: ["设计", "工作室", "展览"],
    bestFor: "设计专业与作品展示",
    access: "工作室区域遵循院系管理规则",
  },
  bs: {
    type: "📍 南校区",
    title: "西浦国际商学院",
    subtitle: "IBSS",
    desc: "商科教育核心楼宇，连接案例教学、国际课程与行业实践。",
    story: "主入口在东侧，北侧与南侧也可进入。",
    tags: ["商科", "案例教学", "职业发展"],
    bestFor: "商科学生 · 职业探索",
    access: "全楼层可达",
  },
  as: {
    type: "📍 南校区",
    title: "影视与创意科技楼",
    subtitle: "影视创意科技楼",
    desc: "融合影视、创意与技术的实践教学空间，服务媒体相关专业。",
    story: "入口位于东南侧，靠近 IR 后方。",
    tags: ["媒体", "创意", "工作室"],
    bestFor: "影视与创意课程",
    access: "大部分楼层开放，个别房间可能受限",
  },
  gym: {
    type: "🎮 南校区",
    title: "体育馆",
    subtitle: "GYM",
    desc: "大型室内体育与活动场馆，支撑校园体育文化与集体活动。",
    story: "东西两侧均设有入口。",
    tags: ["运动", "活动", "健康"],
    bestFor: "运动锻炼与赛事观赛",
    access: "需预约",
  },
};

export function PicturesAndMapScreen() {
  const navigate = useNavigate();
  const { lang, t } = useLanguage();
  const [cur, setCur] = useState(0);
  const [mapTab, setMapTab] = useState<MapTabKey>("map");
  const [activeHotspotId, setActiveHotspotId] = useState("cb");
  const [locationStatus, setLocationStatus] = useState("");

  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<typeof classrooms[0] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const leafletHostRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<L.Map | null>(null);
  const userMarkerRef = useRef<L.CircleMarker | null>(null);
  const accuracyCircleRef = useRef<L.Circle | null>(null);
  const watchIdRef = useRef<number | null>(null);
  const firstFixRef = useRef(false);

  // Live routing demo: cache current position & routing control
  const currentPositionRef = useRef<L.LatLngExpression | null>(null);
  const routingControlRef = useRef<any>(null);

  // Route planning states
  const [routePlanning, setRoutePlanning] = useState(false);
  const [routeReady, setRouteReady] = useState(false);
  const routeSectionRef = useRef<HTMLDivElement>(null);

  // Reset route state whenever a different room is selected
  useEffect(() => {
    setRoutePlanning(false);
    setRouteReady(false);
  }, [selected]);

  const mapCopy =
    lang === "zh"
      ? {
          clickHint: "点击地图点位查看简介",
          notReady: "该点位简介暂未配置",
          startLocating: "点击“开始定位”获取实时位置",
          locating: "正在获取当前位置...",
          locatingWithAccuracy: (meters: number) => `实时定位中，精度约 ${meters} 米`,
          stopLocating: "已停止定位",
          switchedBack: "已切换回校园地图",
          browserUnsupported: "当前浏览器不支持定位功能",
          permissionDenied: "定位权限被拒绝，请在浏览器中允许定位",
          signalUnavailable: "位置信号不可用，请稍后重试",
          timeout: "定位超时，请在室外或网络更稳定环境重试",
          locationUnknown: "无法获取实时位置",
          startButton: "开始定位",
          stopButton: "停止定位",
          bestFor: "适合",
          access: "通行",
          mapTip: "地图点位可点击查看简介；切到实时定位可显示你当前附近位置。",
          liveTip: "地图数据来自 OpenStreetMap，定位需浏览器授权且建议在 HTTPS 环境使用。",
        }
      : {
          clickHint: "Tap a map pin to view details",
          notReady: "Description for this spot is not ready yet",
          startLocating: 'Tap "Start" to get live location',
          locating: "Getting your current location...",
          locatingWithAccuracy: (meters: number) => `Live tracking, accuracy about ${meters} m`,
          stopLocating: "Location tracking stopped",
          switchedBack: "Switched back to campus map",
          browserUnsupported: "Geolocation is not supported by this browser",
          permissionDenied: "Location permission denied. Please allow location access",
          signalUnavailable: "Location signal unavailable. Please retry",
          timeout: "Location request timed out. Try better network/open area",
          locationUnknown: "Unable to get live location",
          startButton: "Start",
          stopButton: "Stop",
          bestFor: "Best for",
          access: "Access",
          mapTip: "Pins are clickable for quick intros; switch to Live Location to see your nearby position.",
          liveTip: "Map data is provided by OpenStreetMap. Browser permission and HTTPS are recommended.",
        };

  const activeLocation =
    (lang === "zh" ? campusLocationInfoZh : campusLocationInfo)[activeHotspotId] ??
    campusLocationInfo[activeHotspotId];
  const XJTLU_CENTER: [number, number] = [31.2718, 120.7415];
  const LIVE_MAP_DEFAULT_ZOOM = 15;
  const LIVE_MAP_MAX_ZOOM = 18;

  useEffect(() => {
    setLocationStatus(mapCopy.startLocating);
  }, [mapCopy.startLocating]);

  const ensureLeafletMap = () => {
    if (leafletMapRef.current) return leafletMapRef.current;
    if (!leafletHostRef.current) return null;

    const map = L.map(leafletHostRef.current, {
      scrollWheelZoom: false,
      zoomControl: true,
      minZoom: 13,
      maxZoom: LIVE_MAP_MAX_ZOOM,
    }).setView(XJTLU_CENTER, LIVE_MAP_DEFAULT_ZOOM);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: LIVE_MAP_MAX_ZOOM,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    L.marker(XJTLU_CENTER).addTo(map).bindPopup("XJTLU");
    leafletMapRef.current = map;
    return map;
  };

  const stopTracking = (message = mapCopy.stopLocating) => {
    if (watchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    firstFixRef.current = false;
    setLocationStatus(message);
  };

  const destroyLeafletMap = () => {
    if (leafletMapRef.current) {
      leafletMapRef.current.remove();
      leafletMapRef.current = null;
    }
    clearRouting();
    userMarkerRef.current = null;
    accuracyCircleRef.current = null;
    leafletHostRef.current = null;
  };

  const resetLiveMapView = () => {
    const map = ensureLeafletMap();
    if (!map) return;
    map.setView(XJTLU_CENTER, LIVE_MAP_DEFAULT_ZOOM, { animate: false });
  };

  const updateUserPosition = (lat: number, lng: number, accuracy: number) => {
    const map = leafletMapRef.current;
    if (!map) return;

    currentPositionRef.current = [lat, lng];

    const acc = Math.max(Number(accuracy) || 0, 5);
    if (userMarkerRef.current && accuracyCircleRef.current) {
      userMarkerRef.current.setLatLng([lat, lng]);
      accuracyCircleRef.current.setLatLng([lat, lng]);
      accuracyCircleRef.current.setRadius(acc);
    } else {
      userMarkerRef.current = L.circleMarker([lat, lng], {
        radius: 7,
        color: "#17316f",
        fillColor: "#5aa6ff",
        fillOpacity: 0.95,
        weight: 2,
      }).addTo(map);
      accuracyCircleRef.current = L.circle([lat, lng], {
        radius: acc,
        color: "#5aa6ff",
        fillColor: "#5aa6ff",
        fillOpacity: 0.12,
        weight: 1,
      }).addTo(map);
    }

    if (!firstFixRef.current) {
      map.setView([lat, lng], Math.max(map.getZoom(), 16));
      firstFixRef.current = true;
    } else {
      map.panTo([lat, lng], { animate: false });
    }
    setLocationStatus(mapCopy.locatingWithAccuracy(Math.round(acc)));
  };

  const startTracking = () => {
    if (!navigator.geolocation) {
      setLocationStatus(mapCopy.browserUnsupported);
      return;
    }

    const map = ensureLeafletMap();
    if (!map) return;
    if (watchIdRef.current != null) navigator.geolocation.clearWatch(watchIdRef.current);
    firstFixRef.current = false;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        updateUserPosition(latitude, longitude, accuracy);
      },
      (err) => {
        const status =
          err.code === 1
            ? mapCopy.permissionDenied
            : err.code === 2
              ? mapCopy.signalUnavailable
              : err.code === 3
                ? mapCopy.timeout
                : mapCopy.locationUnknown;
        setLocationStatus(status);
      },
      { enableHighAccuracy: true, maximumAge: 0, timeout: 25000 },
    );
    setLocationStatus(mapCopy.locating);
  };

  const clearRouting = () => {
    const map = leafletMapRef.current;
    if (map && routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }
    routingControlRef.current = null;
  };

  useEffect(() => {
    if (mapTab === "live") {
      const map = ensureLeafletMap();
      if (map) {
        resetLiveMapView();
        window.setTimeout(() => map.invalidateSize(), 120);
      }
    } else {
      stopTracking(mapCopy.switchedBack);
      destroyLeafletMap();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapTab, mapCopy.switchedBack]);

  useEffect(() => {
    return () => {
      stopTracking(mapCopy.stopLocating);
      destroyLeafletMap();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePlanRoute = () => {
    if (routePlanning || routeReady) return;

    const map = ensureLeafletMap();
    if (!map) return;

    // 没有定位时先尝试开启定位，让用户再点一次
    if (!currentPositionRef.current) {
      startTracking();
      setLocationStatus(
        lang === "zh"
          ? "正在获取当前位置，请允许定位后再点击一次“开始路径规划”"
          : "Getting your current location. Please allow location and tap again.",
      );
      return;
    }

    // demo：终点先统一用校园中心点
    const destinationLatLng = L.latLng(XJTLU_CENTER[0], XJTLU_CENTER[1]);
    const startLatLng = L.latLng(currentPositionRef.current as L.LatLngExpression);

    clearRouting();

    setRoutePlanning(true);
    setRouteReady(false);

    const routing = (L as any).Routing.control({
      waypoints: [startLatLng, destinationLatLng],
      lineOptions: {
        styles: [
          { color: "#4B9EF7", weight: 8, opacity: 0.35 },
          { color: "#2350D8", weight: 4, opacity: 0.95 },
        ],
      },
      addWaypoints: false,
      draggableWaypoints: false,
      routeWhileDragging: false,
      show: false,
      fitSelectedRoutes: true,
      createMarker: () => null,
      router: (L as any).Routing.osrmv1({
        serviceUrl: "https://router.project-osrm.org/route/v1",
        profile: "foot",
      }),
    }).addTo(map);

    routing.on("routesfound", (e: any) => {
      const route = e.routes && e.routes[0];
      if (!route) {
        setRoutePlanning(false);
        return;
      }
      setRoutePlanning(false);
      setRouteReady(true);
      window.setTimeout(() => {
        routeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 150);
    });

    routing.on("routingerror", () => {
      setRoutePlanning(false);
      setRouteReady(false);
      setLocationStatus(
        lang === "zh"
          ? "路线规划失败，请稍后重试（可能是 OSRM 公共服务暂时不可用）"
          : "Routing failed. Please try again later (OSRM public service might be unavailable).",
      );
    });

    routingControlRef.current = routing;
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

        <div style={{ position: "relative", borderRadius: "16px", overflow: "hidden", aspectRatio: "16 / 10", minHeight: "192px", border: `2.5px solid ${C.navy}`, boxShadow: `4px 4px 0 ${C.navy}`, marginBottom: "10px", backgroundColor: "#D8EEFF" }}>
          <img
            src={`${import.meta.env.BASE_URL}${photoDefs[cur].fileName}`}
            alt={t(photoDefs[cur].titleKey)}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
          <div style={{ position: "absolute", top: "10px", left: "10px", backgroundColor: C.yellow, border: `2px solid ${C.navy}`, borderRadius: "8px", padding: "2px 8px", fontSize: "11px", fontWeight: 900, color: C.navy, boxShadow: `2px 2px 0 ${C.navy}` }}>
            {t(photoDefs[cur].tagKey)}
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
            <button key={p.id} onClick={() => setCur(i)} style={{ flex: 1, aspectRatio: "5 / 3", minHeight: "48px", borderRadius: "10px", overflow: "hidden", border: i === cur ? `2.5px solid ${C.navy}` : `2px solid ${C.pale}`, opacity: i === cur ? 1 : 0.55, boxShadow: i === cur ? `2px 2px 0 ${C.navy}` : "none", cursor: "pointer", padding: 0, backgroundColor: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <img
                src={`${import.meta.env.BASE_URL}${p.fileName}`}
                alt={t(p.titleKey)}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
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

        <ComicCard style={{ overflow: "hidden", position: "relative", backgroundColor: C.ice, marginBottom: "18px", padding: "10px" }}>
          {mapTab === "map" ? (
            <div key="campus-map-tab">
              <div style={{ position: "relative", borderRadius: "12px", overflow: "hidden", border: `2px solid ${C.navy}`, boxShadow: `3px 3px 0 ${C.navy}`, backgroundColor: "#E8EEF6" }}>
                <img src={`${import.meta.env.BASE_URL}campus-map.jpg`} alt="XJTLU campus map" style={{ width: "100%", height: "auto", display: "block" }} />
                {campusMapHotspots.map((pin) => (
                  <button
                    key={pin.id}
                    type="button"
                    onClick={() => setActiveHotspotId(pin.id)}
                    aria-label={`${pin.fullName} ${pin.label}`}
                    style={{
                      position: "absolute",
                      left: `${pin.x}%`,
                      top: `${pin.y}%`,
                      transform: "translate(-50%, -50%)",
                      minWidth: "24px",
                      minHeight: "22px",
                      borderRadius: "7px",
                      border: activeHotspotId === pin.id ? `2px solid ${C.yellow}` : "2px solid rgba(255,255,255,0.95)",
                      backgroundColor: pin.color,
                      color: C.white,
                      fontSize: "9px",
                      fontWeight: 900,
                      padding: "0 5px",
                      lineHeight: 1,
                      cursor: "pointer",
                      boxShadow: activeHotspotId === pin.id ? `0 0 0 2px ${C.navy}, 0 6px 14px rgba(0,0,0,0.28)` : "0 4px 12px rgba(0,0,0,0.25)",
                    }}
                  >
                    {pin.label}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: "8px", padding: "10px", borderRadius: "10px", backgroundColor: C.white, border: `2px solid ${C.navy}`, boxShadow: `2px 2px 0 ${C.pale}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#4B6898" }}>{activeLocation?.type ?? mapCopy.clickHint}</span>
                </div>
                <p style={{ marginTop: "5px", fontSize: "14px", fontWeight: 900, color: C.navy }}>
                  {activeLocation?.title ?? mapCopy.notReady}
                </p>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", marginTop: "2px" }}>
                  {activeLocation?.subtitle ?? ""}
                </p>
                <p style={{ marginTop: "7px", fontSize: "11px", lineHeight: 1.45, color: C.navy }}>
                  {activeLocation?.desc ?? ""}
                </p>
                <p style={{ marginTop: "6px", fontSize: "11px", lineHeight: 1.45, color: "#355087", fontWeight: 600 }}>
                  {activeLocation?.story ?? ""}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "8px" }}>
                  {(activeLocation?.tags ?? []).map((tag) => (
                    <span key={tag} style={{ backgroundColor: C.pale, border: `1.5px solid ${C.navy}`, borderRadius: "999px", padding: "1px 8px", fontSize: "10px", fontWeight: 800, color: C.navy }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <div style={{ marginTop: "8px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px" }}>
                  <div style={{ backgroundColor: C.cream, border: `1.5px solid ${C.pale}`, borderRadius: "8px", padding: "6px 8px" }}>
                    <p style={{ fontSize: "10px", color: "#4B6898", fontWeight: 700 }}>{mapCopy.bestFor}</p>
                    <p style={{ fontSize: "11px", color: C.navy, fontWeight: 800, marginTop: "1px" }}>{activeLocation?.bestFor ?? "-"}</p>
                  </div>
                  <div style={{ backgroundColor: C.cream, border: `1.5px solid ${C.pale}`, borderRadius: "8px", padding: "6px 8px" }}>
                    <p style={{ fontSize: "10px", color: "#4B6898", fontWeight: 700 }}>{mapCopy.access}</p>
                    <p style={{ fontSize: "11px", color: C.navy, fontWeight: 800, marginTop: "1px" }}>{activeLocation?.access ?? "-"}</p>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "10px", backgroundColor: C.white, border: `2px solid ${C.pale}` }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: `2px solid ${C.navy}`, backgroundColor: C.royal, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconPin size={12} color={C.white} />
                </div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: C.navy }}>{mapCopy.mapTip}</p>
              </div>
            </div>
          ) : (
            <div key="live-map-tab">
              <div
                ref={leafletHostRef}
                style={{
                  width: "100%",
                  height: "clamp(220px, 34vh, 320px)",
                  borderRadius: "12px",
                  border: `2px solid ${C.navy}`,
                  boxShadow: `3px 3px 0 ${C.navy}`,
                  overflow: "hidden",
                }}
              />
              <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                <button
                  type="button"
                  onClick={startTracking}
                  style={{ flex: 1, height: "36px", borderRadius: "10px", border: `2px solid ${C.navy}`, backgroundColor: C.royal, color: C.white, fontSize: "12px", fontWeight: 800, boxShadow: `2px 2px 0 ${C.navy}`, display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", cursor: "pointer" }}
                >
                  <IconNavigation size={14} color={C.white} />
                  {mapCopy.startButton}
                </button>
                <button
                  type="button"
                  onClick={() => stopTracking(mapCopy.stopLocating)}
                  style={{ flex: 1, height: "36px", borderRadius: "10px", border: `2px solid ${C.navy}`, backgroundColor: C.white, color: C.navy, fontSize: "12px", fontWeight: 800, boxShadow: `2px 2px 0 ${C.navy}`, cursor: "pointer" }}
                >
                  {mapCopy.stopButton}
                </button>
              </div>
              <p style={{ marginTop: "8px", fontSize: "11px", fontWeight: 700, color: "#4B6898" }}>{locationStatus}</p>

              <div style={{ marginTop: "8px", display: "flex", alignItems: "center", gap: "8px", padding: "8px 10px", borderRadius: "10px", backgroundColor: C.white, border: `2px solid ${C.pale}` }}>
                <div style={{ width: "24px", height: "24px", borderRadius: "50%", border: `2px solid ${C.navy}`, backgroundColor: C.royal, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <IconPin size={12} color={C.white} />
                </div>
                <p style={{ fontSize: "11px", fontWeight: 700, color: C.navy }}>{mapCopy.liveTip}</p>
              </div>
            </div>
          )}
        </ComicCard>

        {/* ── Campus Convenience ── */}
        <SectionLabel color={C.mint} text={t("map_convenience")} />

        <ComicCard style={{ padding: "12px", backgroundColor: C.white, marginBottom: "18px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#4B6898", marginBottom: "10px" }}>
            {t("map_convenience_desc")}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {campusConvenienceItems.map((item) => (
              <div
                key={item.titleKey}
                style={{
                  border: `2px solid ${C.pale}`,
                  borderRadius: "12px",
                  padding: "10px",
                  backgroundColor: "#F8FCFF",
                }}
              >
                <p style={{ fontSize: "13px", fontWeight: 900, color: C.navy }}>
                  {item.icon} {t(item.titleKey)}
                </p>
                <p style={{ marginTop: "5px", fontSize: "11px", fontWeight: 700, color: "#355087", lineHeight: 1.45 }}>
                  {t(item.locationsKey)}
                </p>
              </div>
            ))}
          </div>
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
