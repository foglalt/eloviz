import { withBoldFlags, type EmphasizedText } from "./text-emphasis.ts";

type PdfFont = {
  name?: string;
  bold?: boolean;
  black?: boolean;
  cssFontInfo?: { fontWeight?: string | number } | null;
};

export function isBoldPdfFont(font: PdfFont | undefined): boolean {
  if (!font) return false;
  if (font.bold || font.black) return true;
  const weight = font.cssFontInfo?.fontWeight;
  if (Number(weight) >= 600 || (typeof weight === "string" && /^(?:bold|bolder)$/iu.test(weight))) return true;
  // Embedded/subset fonts often expose the original face name, but no weight.
  // Only retain its weight; the PDF font family is never applied to the website.
  const name = font.name?.replace(/^[A-Z]{6}\+/u, "") ?? "";
  return /bold/iu.test(name) || /(?:^|[-_,\s])(?:black|heavy|demi)(?:italic|oblique|mt|psmt)?$/iu.test(name);
}

export function attachTextFontWeight<T extends EmphasizedText & { fontName?: string }>(items: readonly T[], fonts: ReadonlyMap<string, PdfFont>): T[] {
  return items.map((item) => {
    if (!item.fontName || !isBoldPdfFont(fonts.get(item.fontName))) return item;
    return { ...item, ...withBoldFlags(item.text, Array<boolean>(item.text.length).fill(true)) };
  });
}
