import { Subject, Chapter, Topic } from '@/types/topics';
import TopicMetadata from './TopicMetadata';

export interface TopicHeaderProps {
  subject: Subject;
  chapter: Chapter;
  topic: Topic;
}

export default function TopicHeader({
  subject,
  chapter,
  topic,
}: TopicHeaderProps) {
  return (
    <div className="mb-6 md:mb-8">
      <h1 className="text-2xl md:text-3xl font-bold mb-2">{subject.name}</h1>
      <h2 className="text-xl md:text-2xl font-semibold text-[var(--color-accent)]">
        Form {chapter.form} · {chapter.title}
      </h2>
      <h3 className="text-lg md:text-xl font-medium mt-3 md:mt-4">
        {topic.title}
      </h3>
      {topic.description && (
        <p className="text-[var(--color-subtext)] mt-2 text-sm md:text-base">
          {topic.description}
        </p>
      )}
      <TopicMetadata topic={topic} />
    </div>
  );
}
