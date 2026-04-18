/**
 * 校园楼宇 OCR：优先匹配完整楼名（中英），避免仅靠两字母（如 ES）在整段英文里误命中。
 * 缩写顺序仅用于「短语未命中」时的补充匹配。
 */

/** 仅当整段 OCR 里出现这些完整短语时才认定该楼（越长越优先） */
export const BUILDING_PHRASES: { code: string; phrases: string[] }[] = [
  {
    code: "IA",
    phrases: [
      "INTERNATIONAL ACADEMIC EXCHANGE AND COLLABORATION CENTRE",
      "INTERNATIONAL ACADEMIC EXCHANGE AND COLLABORATION CENTER",
      "国际学术交流中心",
      "INTERNATIONAL ACADEMIC EXCHANGE",
    ],
  },
  {
    code: "IR",
    phrases: [
      "INTERNATIONAL RESEARCH CENTRE",
      "INTERNATIONAL RESEARCH CENTER",
      "国际科研中心",
      "INTERNATIONAL RESEARCH",
    ],
  },
  {
    code: "ES",
    phrases: [
      "EMERGING AND INTERDISCIPLINARY SCIENCE BUILDING",
      "EMERGING AND INTERDISCIPLINARY SCIENCE",
      "新兴科学楼",
      "新兴与交叉科学楼",
    ],
  },
  {
    code: "HS",
    phrases: [
      "HUMANITIES AND SOCIAL SCIENCES BUILDING",
      "HUMANITIES AND SOCIAL SCIENCES",
      "人文和社科楼",
      "人文社科楼",
    ],
  },
  {
    code: "EE",
    phrases: [
      "ELECTRICAL AND ELECTRONIC ENGINEERING",
      "电子与电气工程楼",
    ],
  },
  {
    code: "BS",
    phrases: [
      "INTERNATIONAL BUSINESS SCHOOL SUZHOU",
      "西浦国际商学院",
    ],
  },
  {
    code: "AS",
    phrases: [
      "FILM AND CREATIVE TECHNOLOGY BUILDING",
      "影视与创意科技楼",
    ],
  },
  {
    code: "LS",
    phrases: ["LIFE SCIENCES BUILDING", "生命科学楼"],
  },
  {
    code: "FB",
    phrases: ["FOUNDATION BUILDING", "基础楼"],
  },
  {
    code: "CB",
    phrases: ["CENTRAL BUILDING", "中心楼"],
  },
  {
    code: "PB",
    phrases: ["PUBLIC BUILDING", "公共楼"],
  },
  {
    code: "EB",
    phrases: ["ENGINEERING BUILDING", "工科楼"],
  },
  {
    code: "DB",
    phrases: ["DESIGN BUILDING", "设计楼"],
  },
  {
    code: "MA",
    phrases: ["MATHEMATICS BUILDING A", "数学楼 A", "数学楼A"],
  },
  {
    code: "MB",
    phrases: ["MATHEMATICS BUILDING B", "数学楼 B", "数学楼B"],
  },
  {
    code: "SA",
    phrases: ["SCIENCE BUILDING A", "理科楼A", "理科楼 A"],
  },
  {
    code: "SB",
    phrases: ["SCIENCE BUILDING B", "理科楼B", "理科楼 B"],
  },
  {
    code: "SC",
    phrases: ["SCIENCE BUILDING C", "理科楼C", "理科楼 C"],
  },
  {
    code: "SD",
    phrases: ["SCIENCE BUILDING D", "理科楼D", "理科楼 D"],
  },
  {
    code: "GYM",
    phrases: ["GYMNASIUM", "体育馆"],
  },
];

/** 标牌常见「大字分字符」：如 OCR 成 I R、S A */
const SPACED_CODE_PATTERNS: { code: string; pattern: RegExp }[] = [
  { code: "IR", pattern: /\bI[\s\-_.]*R\b/gi },
  { code: "IA", pattern: /\bI[\s\-_.]*A\b/gi },
  { code: "LS", pattern: /\bL[\s\-_.]*S\b/gi },
  { code: "FB", pattern: /\bF[\s\-_.]*B\b/gi },
  { code: "CB", pattern: /\bC[\s\-_.]*B\b/gi },
  { code: "SA", pattern: /\bS[\s\-_.]*A\b/gi },
  { code: "SB", pattern: /\bS[\s\-_.]*B\b/gi },
  { code: "SC", pattern: /\bS[\s\-_.]*C\b/gi },
  { code: "SD", pattern: /\bS[\s\-_.]*D\b/gi },
  { code: "EE", pattern: /\bE[\s\-_.]*E\b/gi },
  { code: "EB", pattern: /\bE[\s\-_.]*B\b/gi },
  { code: "PB", pattern: /\bP[\s\-_.]*B\b/gi },
  { code: "HS", pattern: /\bH[\s\-_.]*S\b/gi },
  { code: "DB", pattern: /\bD[\s\-_.]*B\b/gi },
  { code: "BS", pattern: /\bB[\s\-_.]*S\b/gi },
  { code: "MA", pattern: /\bM[\s\-_.]*A\b/gi },
  { code: "MB", pattern: /\bM[\s\-_.]*B\b/gi },
];

/**
 * 仅靠边界匹配时极易误判的 2 字母代码（例如 ES 出现在其它词中）；
 * 这些代码必须已通过「完整短语」或「分字符大字」命中，否则不再用纯边界二次匹配。
 */
const SHORT_CODES_NO_STANDALONE_MATCH = new Set(["ES", "AS"]);

/** 较长代码优先（纯边界匹配用） */
const BUILDING_CODES_BOUNDARY_ORDER = [
  "GYM",
  "SC", "SB", "SA", "SD",
  "EE", "EB", "PB", "IR", "IA", "HS", "DB", "BS", "MA", "MB",
  "LS", "FB", "CB",
];

function normalizeForPhrases(ocr: string): string {
  return ocr
    .toUpperCase()
    .replace(/[^A-Z0-9\u4e00-\u9fff]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function detectByPhrases(normalized: string): string | null {
  const flat: { code: string; phrase: string; len: number }[] = [];
  for (const { code, phrases } of BUILDING_PHRASES) {
    for (const p of phrases) {
      const phrase = p.toUpperCase().replace(/\s+/g, " ").trim();
      flat.push({ code, phrase, len: phrase.length });
    }
  }
  flat.sort((a, b) => b.len - a.len);
  for (const { code, phrase } of flat) {
    if (phrase.length > 0 && normalized.includes(phrase)) return code;
  }
  return null;
}

/** OCR 常把 Centre 漏掉或拆行；与 IA 区分：IA 侧会有 Academic / Exchange */
function detectIrConjunct(normalized: string): boolean {
  const intl = normalized.includes("INTERNATIONAL");
  const research = normalized.includes("RESEARCH");
  if (!intl || !research) return false;
  const iaHint =
    normalized.includes("ACADEMIC") &&
    (normalized.includes("EXCHANGE") || normalized.includes("COLLABORATION"));
  return !iaHint;
}

function detectBySpacedLetters(raw: string): string | null {
  for (const { code, pattern } of SPACED_CODE_PATTERNS) {
    pattern.lastIndex = 0;
    if (pattern.test(raw)) return code;
  }
  return null;
}

/** 标牌上常见独立一行的大写字母，OCR 常切成单独 token（如 IR、ES） */
const STANDALONE_TOKEN_ORDER = [
  "GYM",
  "IA",
  "IR",
  "HS",
  "EE",
  "EB",
  "PB",
  "DB",
  "BS",
  "MA",
  "MB",
  "LS",
  "FB",
  "CB",
  "SA",
  "SB",
  "SC",
  "SD",
  "ES",
  "AS",
];

function detectByStandaloneTokens(normalized: string): string | null {
  const tokens = new Set(normalized.split(/\s+/).filter(Boolean));
  for (const code of STANDALONE_TOKEN_ORDER) {
    if (tokens.has(code)) return code;
  }
  return null;
}

function detectByBoundaryCodes(upper: string): string | null {
  for (const code of BUILDING_CODES_BOUNDARY_ORDER) {
    if (SHORT_CODES_NO_STANDALONE_MATCH.has(code)) continue;
    const re = new RegExp(`(^|[^A-Z0-9])${code}([^A-Z0-9]|$)`, "g");
    if (re.test(upper)) return code;
  }
  return null;
}

export function detectBuildingCode(ocrText: string): string | null {
  if (!ocrText || !ocrText.trim()) return null;
  const normalized = normalizeForPhrases(ocrText);
  const byPhrase = detectByPhrases(normalized);
  if (byPhrase) return byPhrase;

  if (detectIrConjunct(normalized)) return "IR";

  const spaced = detectBySpacedLetters(ocrText);
  if (spaced) return spaced;

  const byToken = detectByStandaloneTokens(normalized);
  if (byToken) return byToken;

  const upper = ocrText.toUpperCase();
  return detectByBoundaryCodes(upper);
}
