"use client";

import VideoContentPage, { VideoContent } from "./VideoContentPage";
import ArticleContentPage, { ArticleContent } from "./ArticleContentPage";
import ARTICLES_DATA from "./articles-data.json";

export default function ContentPage({
  params,
}: {
  params: { id: string; contentId: string };
}) {
  const content =
    ARTICLES_DATA.find((a) => a.id === params.contentId) ?? ARTICLES_DATA[0];

  if (content.type === "مقرر مرئي") {
    return <VideoContentPage video={content as unknown as VideoContent} />;
  }

  return <ArticleContentPage article={content as unknown as ArticleContent} />;
}
