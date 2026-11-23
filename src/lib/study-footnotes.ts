export type StudyFootnote = { marker: string; text: string };

export const studyFootnoteMarker = /^\*+$/u;

export function findStudyFootnoteMarkers(text: string) {
  return [...text.matchAll(/(?<=[\p{L}\p{N})\]”».,;:!?])[ \t]?(\*+)(?=$|[\s.,;:!?)\]”»])/gu)]
    .map((match) => ({
      marker: match[1],
      start: match.index + match[0].length - match[1].length,
      end: match.index + match[0].length,
    }));
}
