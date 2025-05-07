import { Topic } from '@/types/topics';

export interface TopicMetadataProps {
  topic: Topic;
}

export default function TopicMetadata({ topic }: TopicMetadataProps) {
  return (
    <div className="flex flex-wrap gap-3 md:gap-4 mt-3 md:mt-4">
      {topic.difficulty_level && (
        <div className="flex items-center gap-1 text-sm md:text-base">
          <span className="text-[var(--color-subtext)]">Difficulty:</span>
          <span>{Array(topic.difficulty_level).fill('⭐').join('')}</span>
        </div>
      )}
      {topic.time_estimate_minutes && (
        <div className="flex items-center gap-1 text-sm md:text-base">
          <span className="text-[var(--color-subtext)]">Time:</span>
          <span>{topic.time_estimate_minutes} minutes</span>
        </div>
      )}
    </div>
  );
}
