export type AccessType = "elevator" | "stairs" | "none";

export interface ClassroomLocale {
  building: string;
  duration: string;
  steps: string[];
  floorGuide: string;
  accessDetail: string;
}

export interface Classroom {
  id: number;
  room: string;
  floor: number;
  access: AccessType;
  zh: ClassroomLocale;
  en: ClassroomLocale;
}

export const classrooms: Classroom[] = [
  {
    id: 1, room: "SA101", floor: 1, access: "none",
    zh: {
      building: "科技楼A (SA)", duration: "约3分钟",
      steps: ["📍 从您当前位置出发", "➡️ 向东直行约60米", "🏛️ 到达SA楼正门"],
      floorGuide: "1楼教室，进门后沿主走廊直行，右侧第2间即为SA101。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Science Bldg A (SA)", duration: "~3 min",
      steps: ["📍 From your current location", "➡️ Head east ~60 m", "🏛️ Arrive at SA main entrance"],
      floorGuide: "Floor 1. Walk straight along the main corridor; SA101 is the 2nd room on the right.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 2, room: "SA203", floor: 2, access: "elevator",
    zh: {
      building: "科技楼A (SA)", duration: "约4分钟",
      steps: ["📍 从您当前位置出发", "➡️ 向东直行约60米", "🏛️ 到达SA楼正门", "⬆️ 前往2楼"],
      floorGuide: "2楼教室，出电梯左转，走廊第3间。",
      accessDetail: "推荐乘坐SA楼中央电梯（正门左侧）至2楼",
    },
    en: {
      building: "Science Bldg A (SA)", duration: "~4 min",
      steps: ["📍 From your current location", "➡️ Head east ~60 m", "🏛️ Arrive at SA main entrance", "⬆️ Go to Floor 2"],
      floorGuide: "Floor 2. Turn left out of the elevator; 3rd room along the corridor.",
      accessDetail: "Take the central elevator in SA Bldg (left of main entrance) to Floor 2",
    },
  },
  {
    id: 3, room: "SA305", floor: 3, access: "elevator",
    zh: {
      building: "科技楼A (SA)", duration: "约5分钟",
      steps: ["📍 从您当前位置出发", "➡️ 向东直行约60米", "🏛️ 到达SA楼正门", "⬆️ 前往3楼"],
      floorGuide: "3楼教室，出电梯右转，走廊尽头。",
      accessDetail: "乘坐SA楼中央电梯至3楼，出门右转",
    },
    en: {
      building: "Science Bldg A (SA)", duration: "~5 min",
      steps: ["📍 From your current location", "➡️ Head east ~60 m", "🏛️ Arrive at SA main entrance", "⬆️ Go to Floor 3"],
      floorGuide: "Floor 3. Turn right out of the elevator; room at the end of the corridor.",
      accessDetail: "Take the central elevator in SA Bldg to Floor 3, then turn right",
    },
  },
  {
    id: 4, room: "SB101", floor: 1, access: "none",
    zh: {
      building: "科技楼B (SB)", duration: "约4分钟",
      steps: ["📍 从您当前位置出发", "⬆️ 向北走约80米", "↩️ 在SB楼处左转", "🏛️ 到达SB楼正门"],
      floorGuide: "1楼教室，进门后右侧走廊。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Science Bldg B (SB)", duration: "~4 min",
      steps: ["📍 From your current location", "⬆️ Head north ~80 m", "↩️ Turn left at SB Bldg", "🏛️ Arrive at SB main entrance"],
      floorGuide: "Floor 1. Take the right corridor after entering.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 5, room: "SB302", floor: 3, access: "elevator",
    zh: {
      building: "科技楼B (SB)", duration: "约6分钟",
      steps: ["📍 从您当前位置出发", "⬆️ 向北走约80米", "↩️ 在SB楼处左转", "🏛️ 到达SB楼正门", "⬆️ 前往3楼"],
      floorGuide: "3楼教室，出电梯左转，第2间。",
      accessDetail: "乘坐SB楼北侧电梯（正门进入右转）至3楼",
    },
    en: {
      building: "Science Bldg B (SB)", duration: "~6 min",
      steps: ["📍 From your current location", "⬆️ Head north ~80 m", "↩️ Turn left at SB Bldg", "🏛️ Arrive at SB main entrance", "⬆️ Go to Floor 3"],
      floorGuide: "Floor 3. Turn left out of the elevator; 2nd room.",
      accessDetail: "Take the north elevator in SB Bldg (turn right from main entrance) to Floor 3",
    },
  },
  {
    id: 6, room: "CB101", floor: 1, access: "none",
    zh: {
      building: "中心楼 (CB)", duration: "约5分钟",
      steps: ["📍 从您当前位置出发", "⬆️ 直行至中心广场", "↩️ 右转进入CB楼"],
      floorGuide: "1楼教室，正门后左侧走廊。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Central Bldg (CB)", duration: "~5 min",
      steps: ["📍 From your current location", "⬆️ Walk straight to Central Square", "↩️ Turn right into CB Bldg"],
      floorGuide: "Floor 1. Left corridor past the main entrance.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 7, room: "CB302", floor: 3, access: "elevator",
    zh: {
      building: "中心楼 (CB)", duration: "约7分钟",
      steps: ["📍 从您当前位置出发", "⬆️ 直行至中心广场", "↩️ 右转进入CB楼", "⬆️ 前往3楼"],
      floorGuide: "3楼教室，出电梯直走，左侧第4间。",
      accessDetail: "乘坐CB楼中央电梯（大厅正中）至3楼",
    },
    en: {
      building: "Central Bldg (CB)", duration: "~7 min",
      steps: ["📍 From your current location", "⬆️ Walk straight to Central Square", "↩️ Turn right into CB Bldg", "⬆️ Go to Floor 3"],
      floorGuide: "Floor 3. Walk straight out of elevator; 4th room on the left.",
      accessDetail: "Take the central elevator in CB Bldg (center of lobby) to Floor 3",
    },
  },
  {
    id: 8, room: "EE101", floor: 1, access: "none",
    zh: {
      building: "电子楼 (EE)", duration: "约4分钟",
      steps: ["📍 从您当前位置出发", "➡️ 向东北方向行走约100米", "🏛️ 到达EE楼正门"],
      floorGuide: "1楼教室，正门进入后左转走廊。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Electronics Bldg (EE)", duration: "~4 min",
      steps: ["📍 From your current location", "➡️ Head northeast ~100 m", "🏛️ Arrive at EE main entrance"],
      floorGuide: "Floor 1. Turn left after entering the main entrance.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 9, room: "EE204", floor: 2, access: "stairs",
    zh: {
      building: "电子楼 (EE)", duration: "约5分钟",
      steps: ["📍 从您当前位置出发", "➡️ 向东北方向行走约100米", "🏛️ 到达EE楼正门", "⬆️ 前往2楼"],
      floorGuide: "2楼教室，出楼梯右转，第2间。",
      accessDetail: "建议走EE楼北侧楼梯（正门右转）至2楼，无电梯",
    },
    en: {
      building: "Electronics Bldg (EE)", duration: "~5 min",
      steps: ["📍 From your current location", "➡️ Head northeast ~100 m", "🏛️ Arrive at EE main entrance", "⬆️ Go to Floor 2"],
      floorGuide: "Floor 2. Turn right from stairwell; 2nd room.",
      accessDetail: "Use the north staircase in EE Bldg (turn right from main entrance) to Floor 2 — no elevator",
    },
  },
  {
    id: 10, room: "MS101", floor: 1, access: "none",
    zh: {
      building: "数学楼 (MS)", duration: "约5分钟",
      steps: ["📍 从您当前位置出发", "⬆️ 向图书馆方向直行约120米", "🏛️ 到达MS楼侧门"],
      floorGuide: "1楼教室，侧门进入后直行右转。",
      accessDetail: "无需乘梯，1楼直接进入",
    },
    en: {
      building: "Math Bldg (MS)", duration: "~5 min",
      steps: ["📍 From your current location", "⬆️ Head toward Library ~120 m", "🏛️ Arrive at MS side entrance"],
      floorGuide: "Floor 1. Enter via side door, walk straight then turn right.",
      accessDetail: "No elevator needed — direct entry on Floor 1",
    },
  },
  {
    id: 11, room: "MS401", floor: 4, access: "elevator",
    zh: {
      building: "数学楼 (MS)", duration: "约8分钟",
      steps: ["📍 从您当前位置出发", "⬆️ 向图书馆方向直行约120米", "🏛️ 到达MS楼侧门", "⬆️ 前往4楼"],
      floorGuide: "4楼教室，出电梯左转，走廊第1间。",
      accessDetail: "乘坐MS楼主电梯（正门大厅）至4楼（推荐）或走北侧楼梯",
    },
    en: {
      building: "Math Bldg (MS)", duration: "~8 min",
      steps: ["📍 From your current location", "⬆️ Head toward Library ~120 m", "🏛️ Arrive at MS side entrance", "⬆️ Go to Floor 4"],
      floorGuide: "Floor 4. Turn left out of elevator; 1st room in the corridor.",
      accessDetail: "Take the main elevator in MS Bldg (main lobby) to Floor 4 (recommended) or use north stairs",
    },
  },
  {
    id: 12, room: "LB201", floor: 2, access: "elevator",
    zh: {
      building: "图书馆 (LB)", duration: "约6分钟",
      steps: ["📍 从您当前位置出发", "⬆️ 直行约130米", "🏛️ 到达图书馆正门", "⬆️ 前往2楼"],
      floorGuide: "2楼阅览室，出电梯后右转即是。",
      accessDetail: "乘坐图书馆主电梯（大厅右侧）至2楼",
    },
    en: {
      building: "Library (LB)", duration: "~6 min",
      steps: ["📍 From your current location", "⬆️ Walk straight ~130 m", "🏛️ Arrive at Library main entrance", "⬆️ Go to Floor 2"],
      floorGuide: "Floor 2 Reading Room. Turn right out of the elevator.",
      accessDetail: "Take the main elevator in the Library (right side of lobby) to Floor 2",
    },
  },
  {
    id: 13, room: "IB305", floor: 3, access: "elevator",
    zh: {
      building: "国际楼 (IB)", duration: "约7分钟",
      steps: ["📍 从您当前位置出发", "↩️ 向南行走约100米", "🏛️ 到达IB楼正门", "⬆️ 前往3楼"],
      floorGuide: "3楼会议室，出电梯右转，尽头左侧。",
      accessDetail: "乘坐IB楼南侧电梯至3楼，出门右转",
    },
    en: {
      building: "International Bldg (IB)", duration: "~7 min",
      steps: ["📍 From your current location", "↩️ Head south ~100 m", "🏛️ Arrive at IB main entrance", "⬆️ Go to Floor 3"],
      floorGuide: "Floor 3 Meeting Room. Turn right from elevator, then left at the end.",
      accessDetail: "Take the south elevator in IB Bldg to Floor 3, turn right on exit",
    },
  },
  {
    id: 14, room: "ES201", floor: 2, access: "stairs",
    zh: {
      building: "工程楼 (ES)", duration: "约5分钟",
      steps: ["📍 从您当前位置出发", "➡️ 右转约80米", "🏛️ 到达ES楼正门", "⬆️ 前往2楼"],
      floorGuide: "2楼实验室，出楼梯左转，第4间。",
      accessDetail: "ES楼走主楼梯（正门右侧）至2楼，暂无电梯",
    },
    en: {
      building: "Engineering Bldg (ES)", duration: "~5 min",
      steps: ["📍 From your current location", "➡️ Turn right ~80 m", "🏛️ Arrive at ES main entrance", "⬆️ Go to Floor 2"],
      floorGuide: "Floor 2 Lab. Turn left from stairwell; 4th room.",
      accessDetail: "Use the main staircase in ES Bldg (right of main entrance) to Floor 2 — no elevator available",
    },
  },
];
