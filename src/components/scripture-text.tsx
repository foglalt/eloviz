import { bibleVerseHref } from "@/lib/bible-core";
import { findScriptureReferenceMentions } from "@/lib/scripture-references";
import { Fragment } from "react";
import type { BoldRange } from "@/lib/text-emphasis";

function EmphasizedSlice({ text, boldRanges, start, end }: { text: string; boldRanges: BoldRange[]; start: number; end: number }) {
  const ranges = boldRanges.filter((range) => range.end > start && range.start < end)
    .map((range) => ({ start: Math.max(start, range.start), end: Math.min(end, range.end) }));
  return <>{ranges.map((range, index) => <Fragment key={range.start}>
    {text.slice(ranges[index - 1]?.end ?? start, range.start)}<strong>{text.slice(range.start, range.end)}</strong>
  </Fragment>)}{text.slice(ranges.at(-1)?.end ?? start, end)}</>;
}

export function ScriptureText({ text, boldRanges = [] }: { text: string; boldRanges?: BoldRange[] }) {
  const mentions = findScriptureReferenceMentions(text);
  return <>{mentions.map((mention, index) => {
    const before = <EmphasizedSlice text={text} boldRanges={boldRanges} start={mentions[index - 1]?.end ?? 0} end={mention.start} />;
    return <span key={mention.start}>{before}<a className="study-scripture-link"
      href={bibleVerseHref(mention.osisStart) ?? "/biblia"}
      data-bible-start={mention.osisStart} data-bible-end={mention.osisEnd}
      data-bible-label={mention.displayLabel} title={`${mention.displayLabel} – olvasás a Bibliában`}>
      <EmphasizedSlice text={text} boldRanges={boldRanges} start={mention.start} end={mention.end} />
    </a></span>;
  })}<EmphasizedSlice text={text} boldRanges={boldRanges} start={mentions.at(-1)?.end ?? 0} end={text.length} /></>;
}
