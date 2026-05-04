import React from "react";
import ArticleRenderer from "../../components/ArticleRenderer";
import articleData from "../../data/articles/prompts-to-pipelines.json";

export default function ArticlePage() {
  return <ArticleRenderer article={articleData} />;
}
