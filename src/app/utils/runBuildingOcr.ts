/** 对照片做英文 OCR，用于识别楼栋缩写（标牌以英文为主）；按需加载 tesseract 以减轻首屏体积 */
export async function runBuildingOcrOnFile(file: File): Promise<string> {
  const { default: Tesseract } = await import("tesseract.js");
  const result = await Tesseract.recognize(file, "eng", {
    logger: () => {
      /* 静默；避免控制台刷屏 */
    },
  });
  return typeof result.data.text === "string" ? result.data.text : "";
}
