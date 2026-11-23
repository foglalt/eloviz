import { bibleVerseHref } from "@/lib/bible-core";
import { findScriptureReferenceMentions } from "@/lib/scripture-references";
import { Fragment } from "react";
import type { BoldRange } from "@/lib/text-emphasis";
import { findStudyFootnoteMarkers, type StudyFootnote as Footnote } from "@/lib/study-footnotes";
import { StudyFootnote } from "./study-footnote";
import { StudySpoiler } from "./study-spoiler";

function EmphasizedSlice({ text, boldRanges, start, end }: { text: string; boldRanges: BoldRange[]; start: number; end: number }) {
  const ranges = boldRanges.filter((range) => range.end > start && range.start < end)
    .map((range) => ({ start: Math.max(start, range.start), end: Math.min(end, range.end) }));
  return <>{ranges.map((range, index) => <Fragment key={range.start}>
    {text.slice(ranges[index - 1]?.end ?? start, range.start)}<strong>{text.slice(range.start, range.end)}</strong>
  </Fragment>)}{text.slice(ranges.at(-1)?.end ?? start, end)}</>;
}

function PassageSlice({ text, boldRanges, mentions, start, end }: { text: string; boldRanges: BoldRange[]; mentions: ReturnType<typeof findScriptureReferenceMentions>; start: number; end: number }) {
  const visible = mentions.filter((mention) => mention.end > start && mention.start < end);
  return <>{visible.map((mention, index) => {
    const before = <EmphasizedSlice text={text} boldRanges={boldRanges} start={Math.max(start, visible[index - 1]?.end ?? start)} end={Math.max(start, mention.start)} />;
    return <span key={mention.start}>{before}<a className="study-scripture-link"
      href={bibleVerseHref(mention.osisStart) ?? "/biblia"}
      data-bible-start={mention.osisStart} data-bible-end={mention.osisEnd}
      data-bible-label={mention.displayLabel} title={`${mention.displayLabel} – olvasás a Bibliában`}>
      <EmphasizedSlice text={text} boldRanges={boldRanges} start={Math.max(start, mention.start)} end={Math.min(end, mention.end)} />
    </a></span>;
  })}<EmphasizedSlice text={text} boldRanges={boldRanges} start={Math.min(end, Math.max(start, visible.at(-1)?.end ?? start))} end={end} /></>;
}

export function ScriptureText({ text, boldRanges = [], spoilerRanges = [], footnotes = [] }: {
  text: string;
  boldRanges?: BoldRange[];
  spoilerRanges?: BoldRange[];
  footnotes?: Footnote[];
}) {
  const mentions = findScriptureReferenceMentions(text);
  const slice = (start: number, end: number) => <PassageSlice text={text} boldRanges={boldRanges} mentions={mentions} start={start} end={end} />;
  const annotated = footnotes.length ? findStudyFootnoteMarkers(text).flatMap((marker) => {
    const note = footnotes.find((entry) => entry.marker === marker.marker);
    return note ? [{ ...marker, note }] : [];
  }) : [];

  function annotatedSlice(start: number, end: number) {
    const markers = annotated.filter((marker) => marker.start >= start && marker.end <= end);
    return <>{markers.map((marker, index) => <Fragment key={marker.start}>
      {slice(markers[index - 1]?.end ?? start, marker.start)}
      <StudyFootnote number={marker.marker.length}><ScriptureText text={marker.note.text} /></StudyFootnote>
    </Fragment>)}{slice(markers.at(-1)?.end ?? start, end)}</>;
  }

  return <>{spoilerRanges.map((range, index) => <Fragment key={range.start}>
    {annotatedSlice(spoilerRanges[index - 1]?.end ?? 0, range.start)}
    <StudySpoiler>{annotatedSlice(range.start, range.end)}</StudySpoiler>
  </Fragment>)}{annotatedSlice(spoilerRanges.at(-1)?.end ?? 0, text.length)}</>;
}
