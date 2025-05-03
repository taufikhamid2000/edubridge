import React from 'react';

export default function ChapterList({
  chapters,
}: {
  chapters: { id: number; title: string }[];
}) {
  return (
    <ul>
      {chapters.map((chapter) => (
        <li key={chapter.id}>{chapter.title}</li>
      ))}
    </ul>
  );
}
