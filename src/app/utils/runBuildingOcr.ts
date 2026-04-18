const silentLogger = () => {
  /* 静默 */
};

/** 按界面语言选 OCR：英文模式优先 eng（英文标牌更稳），中文模式用 eng+chi_sim 兼顾中文；失败则降级 */
export async function runBuildingOcrOnFile(file: File, lang: "zh" | "en"): Promise<string> {
  const { default: Tesseract } = await import("tesseract.js");
  const chain: string[] =
    lang === "zh" ? ["eng+chi_sim", "eng"] : ["eng", "eng+chi_sim"];

  for (const langTag of chain) {
    try {
      const result = await Tesseract.recognize(file, langTag, { logger: silentLogger });
      const text = typeof result.data.text === "string" ? result.data.text : "";
      if (text.trim().length > 0) return text;
    } catch {
      /* 尝试下一种语言包 */
    }
  }
  return "";
}
