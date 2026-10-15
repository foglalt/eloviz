export type BoldRange = { start: number; end: number };
export type EmphasizedText = { text: string; boldRanges?: BoldRange[] };

export function boldRangesFromFlags(flags: readonly boolean[]): BoldRange[] {
  const ranges: BoldRange[] = [];
  for (let index = 0; index < flags.length; index += 1) {
    if (!flags[index]) continue;
    const start = index;
    while (flags[index + 1]) index += 1;
    ranges.push({ start, end: index + 1 });
  }
  return ranges;
}

export function withBoldFlags(text: string, flags: readonly boolean[]): EmphasizedText {
  const boldRanges = boldRangesFromFlags(flags);
  return boldRanges.length ? { text, boldRanges } : { text };
}

export function textBoldFlags(value: EmphasizedText): boolean[] {
  const flags = Array<boolean>(value.text.length).fill(false);
  for (const range of value.boldRanges ?? []) {
    for (let index = Math.max(0, range.start); index < Math.min(value.text.length, range.end); index += 1) flags[index] = true;
  }
  return flags;
}

export function sliceEmphasizedText(value: EmphasizedText, start: number, end = value.text.length): EmphasizedText {
  if (!value.boldRanges?.length) return { text: value.text.slice(start, end) };
  return withBoldFlags(value.text.slice(start, end), textBoldFlags(value).slice(start, end));
}

export function concatEmphasizedText(...values: EmphasizedText[]): EmphasizedText {
  if (values.every((value) => !value.boldRanges?.length)) return { text: values.map((value) => value.text).join("") };
  return withBoldFlags(values.map((value) => value.text).join(""), values.flatMap(textBoldFlags));
}

// Run the same whitespace/punctuation cleanup on text and its emphasis offsets.
export function cleanEmphasizedText(value: EmphasizedText, punctuation = true): EmphasizedText {
  if (!punctuation && !value.boldRanges?.length) return { text: value.text.replace(/\s+/g, " ").trim() };
  if (!value.boldRanges?.length) return { text: value.text
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/\s+/g, " ").replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([.!?])(?=\d+\s)/g, "$1 ").trim() };
  let text = value.text;
  let flags = textBoldFlags(value);
  function replace(pattern: RegExp, replacement: (match: RegExpExecArray) => { text: string; flags: boolean[] }) {
    let nextText = "";
    const nextFlags: boolean[] = [];
    let cursor = 0;
    for (const match of text.matchAll(pattern)) {
      nextText += text.slice(cursor, match.index);
      nextFlags.push(...flags.slice(cursor, match.index));
      const next = replacement(match);
      nextText += next.text;
      nextFlags.push(...next.flags);
      cursor = match.index + match[0].length;
    }
    nextText += text.slice(cursor);
    nextFlags.push(...flags.slice(cursor));
    text = nextText;
    flags = nextFlags;
  }
  if (punctuation) replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, () => ({ text: "", flags: [] }));
  replace(/\s+/g, (match) => ({ text: " ", flags: [flags.slice(match.index, match.index + match[0].length).every(Boolean)] }));
  if (punctuation) {
    replace(/\s+([,.;:!?])/g, (match) => ({ text: match[1], flags: [flags[match.index + match[0].length - 1]] }));
    replace(/([.!?])(?=\d+\s)/g, (match) => ({ text: `${match[1]} `, flags: [flags[match.index], false] }));
  }
  const start = text.length - text.trimStart().length;
  const end = text.trimEnd().length;
  return withBoldFlags(text.slice(start, end), flags.slice(start, end));
}

export function validBoldRanges(value: unknown, text: string): value is BoldRange[] {
  return Array.isArray(value) && value.length <= text.length && value.every((entry, index) => {
    if (!entry || typeof entry !== "object") return false;
    const { start, end } = entry as BoldRange;
    return Number.isInteger(start) && Number.isInteger(end) && start >= 0 && end > start && end <= text.length
      && (index === 0 || start >= (value[index - 1] as BoldRange).end);
  });
}
