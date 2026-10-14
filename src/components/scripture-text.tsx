import { bibleVerseHref } from "@/lib/bible-core";
import { findScriptureReferenceMentions } from "@/lib/scripture-references";

export function ScriptureText({ text }: { text: string }) {
  const mentions = findScriptureReferenceMentions(text);
  return <>{mentions.map((mention, index) => {
    const before = text.slice(mentions[index - 1]?.end ?? 0, mention.start);
    return <span key={mention.start}>{before}<a className="study-scripture-link"
      href={bibleVerseHref(mention.osisStart) ?? "/biblia"}
      data-bible-start={mention.osisStart} data-bible-end={mention.osisEnd}
      data-bible-label={mention.displayLabel} title={`${mention.displayLabel} – olvasás a Bibliában`}>
      {text.slice(mention.start, mention.end)}
    </a></span>;
  })}{text.slice(mentions.at(-1)?.end ?? 0)}</>;
}
