import type { StudyArticle as StudyArticleContent } from "@/lib/study-article";
import type { BoldRange } from "@/lib/text-emphasis";
import { ScriptureText } from "./scripture-text";

type Props = {
  article: StudyArticleContent;
};

export function StudyArticle({ article }: Props) {
  const renderText = (text: string, boldRanges?: BoldRange[], spoilerRanges?: BoldRange[]) =>
    <ScriptureText text={text} boldRanges={boldRanges} spoilerRanges={spoilerRanges} footnotes={article.footnotes} />;
  return (
    <div className="study-article">
      {article.blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "heading") {
          return block.level === 2
            ? <h2 key={key}>{renderText(block.text, block.boldRanges, block.spoilerRanges)}</h2>
            : <h3 key={key}>{renderText(block.text, block.boldRanges, block.spoilerRanges)}</h3>;
        }
        if (block.type === "scripture") {
          return (
            <blockquote key={key} className="study-article__scripture">
              <p>{renderText(block.text, block.boldRanges, block.spoilerRanges)}</p>
            </blockquote>
          );
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={key} start={block.ordered ? block.start : undefined}>
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{renderText(item, block.itemBoldRanges?.[itemIndex], block.itemSpoilerRanges?.[itemIndex])}</li>
              ))}
            </List>
          );
        }
        return <p key={key}>{renderText(block.text, block.boldRanges, block.spoilerRanges)}</p>;
      })}
    </div>
  );
}
