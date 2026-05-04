import React from "react";

export default function ArticleRenderer({ article }) {
  return (
    <div className="article-container">
      <h1>{article.title}</h1>
      <p className="article-description">{article.description}</p>

      {article.content.map((block, idx) => {
        switch (block.type) {
          case "heading":
            return React.createElement(
              `h${block.level}`,
              { key: idx },
              block.text
            );

          case "paragraph":
            return <p key={idx}>{block.text}</p>;

          case "quote":
            return (
              <blockquote key={idx}>
                {block.text.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </blockquote>
            );

          case "divider":
            return <hr key={idx} />;

          default:
            return null;
        }
      })}
    </div>
  );
}
