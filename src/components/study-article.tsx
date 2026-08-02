import type { StudyArticle as StudyArticleContent } from "@/lib/study-article";

type Props = {
  article: StudyArticleContent;
};

export function StudyArticle({ article }: Props) {
  return (
    <div className="study-article">
      {article.blocks.map((block, index) => {
        const key = `${block.type}-${index}`;
        if (block.type === "heading") {
          return block.level === 2
            ? <h2 key={key}>{block.text}</h2>
            : <h3 key={key}>{block.text}</h3>;
        }
        if (block.type === "scripture") {
          return (
            <blockquote key={key} className="study-article__scripture">
              <p>{block.text}</p>
            </blockquote>
          );
        }
        if (block.type === "list") {
          const List = block.ordered ? "ol" : "ul";
          return (
            <List key={key}>
              {block.items.map((item, itemIndex) => (
                <li key={`${key}-${itemIndex}`}>{item}</li>
              ))}
            </List>
          );
        }
        return <p key={key}>{block.text}</p>;
      })}
    </div>
  );
}
