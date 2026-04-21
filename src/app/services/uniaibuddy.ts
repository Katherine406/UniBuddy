import type { Lang } from "../context/LanguageContext";
import knowledgeMarkdownRaw from "../../../knowledge.md?raw";

type KnowledgeEntry = {
  id: number;
  question: string;
  answer: string;
  combined: string;
};

export const UNI_AI_FALLBACK_ZH = "抱歉，这个问题目前不在 UniAIBuddy 的已收录知识中。";
export const UNI_AI_FALLBACK_EN = "Sorry, this question is not in UniAIBuddy's recorded knowledge base yet.";

const STOPWORDS = new Set([
  "的", "了", "是", "吗", "我", "你", "他", "她", "它", "和", "与", "及", "在", "有", "怎么", "如何",
  "what", "how", "is", "are", "the", "a", "an", "to", "in", "on", "for", "of", "do", "does", "can",
]);

function tokenize(input: string): string[] {
  const chunks = input.toLowerCase().match(/[\u4e00-\u9fff]{1,}|[a-z0-9]+/g) ?? [];
  return chunks.filter((w) => {
    if (STOPWORDS.has(w)) return false;
    const isCjk = /[\u4e00-\u9fff]/.test(w);
    if (isCjk) return w.length >= 2;
    return w.length >= 2;
  });
}

function parseKnowledgeEntries(markdown: string): KnowledgeEntry[] {
  const lines = markdown.split(/\r?\n/);
  const entries: KnowledgeEntry[] = [];
  let currentId = 0;
  let currentQuestion = "";
  let answerBuffer: string[] = [];

  const pushCurrent = () => {
    if (!currentQuestion) return;
    const answer = answerBuffer.join(" ").replace(/\s+/g, " ").trim();
    if (!answer) return;
    entries.push({
      id: currentId,
      question: currentQuestion.trim(),
      answer,
      combined: `${currentQuestion} ${answer}`.toLowerCase(),
    });
  };

  for (const line of lines) {
    const matched = line.match(/^###\s*(\d+)\)\s*(.+)$/);
    if (matched) {
      pushCurrent();
      currentId = Number(matched[1]);
      currentQuestion = matched[2]?.trim() ?? "";
      answerBuffer = [];
      continue;
    }
    if (currentQuestion) {
      if (line.startsWith("## ")) break;
      if (line.trim()) answerBuffer.push(line.trim());
    }
  }
  pushCurrent();
  return entries;
}

const KNOWLEDGE_ENTRIES = parseKnowledgeEntries(knowledgeMarkdownRaw);

function scoreEntry(query: string, entry: KnowledgeEntry): number {
  const queryTokens = tokenize(query);
  if (queryTokens.length === 0) return 0;
  let score = 0;
  for (const token of queryTokens) {
    if (entry.question.toLowerCase().includes(token)) score += 4;
    else if (entry.combined.includes(token)) score += 2;
  }
  return score;
}

function searchKnowledge(query: string, limit = 3): KnowledgeEntry[] {
  return KNOWLEDGE_ENTRIES
    .map((entry) => ({ entry, score: scoreEntry(query, entry) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.entry);
}

async function askDeepSeek(question: string, contextEntries: KnowledgeEntry[], lang: Lang): Promise<string> {
  const apiKey = (import.meta.env.VITE_DEEPSEEK_API_KEY as string | undefined)?.trim();
  if (!apiKey) {
    return contextEntries[0]?.answer ?? (lang === "zh" ? UNI_AI_FALLBACK_ZH : UNI_AI_FALLBACK_EN);
  }

  const contextText = contextEntries
    .map((entry) => `Q: ${entry.question}\nA: ${entry.answer}`)
    .join("\n\n");

  const systemPrompt =
    lang === "zh"
      ? "你是 UniAIBuddy。只能依据给定知识作答，不得编造。回答简洁、友好、可执行。若知识不足，必须回复：抱歉，这个问题目前不在 UniAIBuddy 的已收录知识中。"
      : "You are UniAIBuddy. Answer only based on the provided knowledge, without fabrication. Keep answers concise and actionable. If knowledge is insufficient, you MUST reply: Sorry, this question is not in UniAIBuddy's recorded knowledge base yet.";

  const response = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "deepseek-chat",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `用户问题：${question}\n\n可用知识如下：\n${contextText}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek request failed: ${response.status}`);
  }

  const data = await response.json() as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    return contextEntries[0]?.answer ?? (lang === "zh" ? UNI_AI_FALLBACK_ZH : UNI_AI_FALLBACK_EN);
  }
  return content;
}

export async function askUniAIBuddy(question: string, lang: Lang): Promise<string> {
  const q = question.trim();
  if (!q) return lang === "zh" ? UNI_AI_FALLBACK_ZH : UNI_AI_FALLBACK_EN;

  const hits = searchKnowledge(q, 3);
  if (hits.length === 0) {
    return lang === "zh" ? UNI_AI_FALLBACK_ZH : UNI_AI_FALLBACK_EN;
  }

  try {
    return await askDeepSeek(q, hits, lang);
  } catch {
    return hits[0]?.answer ?? (lang === "zh" ? UNI_AI_FALLBACK_ZH : UNI_AI_FALLBACK_EN);
  }
}
