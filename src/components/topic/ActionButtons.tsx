import { useRouter } from 'next/navigation';
import { Subject, Chapter, Topic } from '@/types/topics';

export interface ActionButtonsProps {
  subjectData: Subject | null;
  topicData: Topic | null;
  chapterData: Chapter | null;
  subject: string;
  topic: string;
}

export default function ActionButtons({
  subjectData,
  topicData,
  chapterData,
  subject,
  topic,
}: ActionButtonsProps) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-3 my-6 justify-center sm:justify-end">
      <button
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-md transition-colors w-full sm:w-auto"
        onClick={() =>
          router.push(
            `/quiz/${subject}/${topic}/create?chapter=${chapterData?.title}`
          )
        }
      >
        Create a Quiz
      </button>
      <button
        className="px-4 py-2 bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-600 text-white rounded-md transition-colors w-full sm:w-auto"
        onClick={() => {
          const descriptionPrompt = `Generate a description for the subject '${subjectData?.name}', tingkatan '${chapterData?.form}', chapter '${chapterData?.title}', and topic '${topicData?.title}' based on the KSSM syllabus.`;
          const chatGPTUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(descriptionPrompt)}`;
          window.open(chatGPTUrl, '_blank');
        }}
      >
        Generate Description with AI
      </button>
      <button
        className="px-4 py-2 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white rounded-md transition-colors w-full sm:w-auto"
        onClick={() => {
          const quizPrompt = `Generate a quiz for the subject '${subjectData?.name}', tingkatan '${chapterData?.form}', chapter '${chapterData?.title}', and topic '${topicData?.title}' based on the KSSM syllabus.`;
          const chatGPTUrl = `https://chat.openai.com/?prompt=${encodeURIComponent(quizPrompt)}`;
          window.open(chatGPTUrl, '_blank');
        }}
      >
        Generate Quiz with AI
      </button>
    </div>
  );
}
