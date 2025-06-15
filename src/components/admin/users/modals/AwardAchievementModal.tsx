import { useState } from 'react';

interface AwardFormData {
  title: string;
  description: string;
  earned_at: string;
}

interface AwardAchievementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAward: (formData: AwardFormData) => Promise<void>;
  initialFormData?: AwardFormData;
}

export default function AwardAchievementModal({
  isOpen,
  onClose,
  onAward,
  initialFormData = {
    title: '',
    description: '',
    earned_at: new Date().toISOString().split('T')[0],
  },
}: AwardAchievementModalProps) {
  const [formData, setFormData] = useState<AwardFormData>(initialFormData);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    if (!formData.title) {
      alert('Please enter an achievement title');
      return;
    }
    await onAward(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-gray-800 dark:bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h3 className="text-xl font-bold mb-4 text-white dark:text-gray-900">
          Award Achievement
        </h3>

        <div className="mb-4">
          <label
            className="block text-gray-300 dark:text-gray-700 text-sm font-bold mb-2"
            htmlFor="title"
          >
            Achievement Title*
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-600 dark:border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-white dark:text-gray-900"
            required
          />
        </div>

        <div className="mb-4">
          <label
            className="block text-gray-300 dark:text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-600 dark:border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-white dark:text-gray-900"
            rows={3}
          />
        </div>

        <div className="mb-6">
          <label
            className="block text-gray-300 dark:text-gray-700 text-sm font-bold mb-2"
            htmlFor="earnedAt"
          >
            Date Earned
          </label>
          <input
            type="date"
            id="earnedAt"
            value={formData.earned_at}
            onChange={(e) =>
              setFormData({ ...formData, earned_at: e.target.value })
            }
            className="w-full px-3 py-2 border border-gray-600 dark:border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-white dark:text-gray-900"
          />
        </div>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-200 dark:text-gray-800 rounded hover:bg-gray-400 dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700"
          >
            Award
          </button>
        </div>
      </div>
    </div>
  );
}
