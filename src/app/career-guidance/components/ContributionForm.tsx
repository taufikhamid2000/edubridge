'use client';

import { FC, useState } from 'react';
import { CareerContribution } from '../types';
import { submitCareerContribution } from '../services/contributionService';

interface ContributionFormProps {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

const ContributionForm: FC<ContributionFormProps> = ({
  onSubmitSuccess,
  onCancel,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<CareerContribution>>({
    title: '',
    description: '',
    mustLearnSubjects: [],
    shouldLearnSubjects: [],
    canLearnSubjects: [],
    submitterName: '',
    submitterEmail: '',
    additionalNotes: '',
  });

  // Temporary subject input states for the comma-separated inputs
  const [mustLearnInput, setMustLearnInput] = useState('');
  const [shouldLearnInput, setShouldLearnInput] = useState('');
  const [canLearnInput, setCanLearnInput] = useState('');

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Split comma-separated input into array and update the form data
  const handleSubjectsChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    field: keyof Pick<
      CareerContribution,
      'mustLearnSubjects' | 'shouldLearnSubjects' | 'canLearnSubjects'
    >
  ) => {
    setter(value);
    // Convert comma-separated string into array, remove whitespace, and filter out empty entries
    const subjects = value
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s);
    setFormData((prev) => ({ ...prev, [field]: subjects }));
  };

  // Handle form field changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Basic validation
      if (
        !formData.title ||
        !formData.description ||
        !formData.submitterName ||
        !formData.submitterEmail
      ) {
        throw new Error('Please fill out all required fields.');
      }

      if (formData.mustLearnSubjects?.length === 0) {
        throw new Error(
          'Please provide at least one subject that must be learned for this career.'
        );
      }

      // Submit the form data
      const result = await submitCareerContribution(
        formData as CareerContribution
      );

      if (!result.success) {
        throw new Error(result.error || 'Failed to submit contribution');
      }

      // Success handling
      setSuccess(true);
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'An unknown error occurred'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 max-w-3xl mx-auto border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Contribute a Career Pathway
      </h2>{' '}
      {success ? (
        <div className="bg-green-950 border border-green-900 text-green-300 p-4 rounded-md mb-6">
          <p className="font-medium">Thank you for your contribution!</p>
          <p className="mt-1">
            Our team will review your submission and add it to our career
            pathways if approved. You&apos;ll receive an email notification when
            the review is complete.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                title: '',
                description: '',
                mustLearnSubjects: [],
                shouldLearnSubjects: [],
                canLearnSubjects: [],
                submitterName: '',
                submitterEmail: '',
                additionalNotes: '',
              });
              setMustLearnInput('');
              setShouldLearnInput('');
              setCanLearnInput('');
            }}
            className="mt-3 text-sm font-medium text-green-400 hover:text-green-200"
          >
            Submit another contribution
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {' '}
          {error && (
            <div className="bg-red-950 border border-red-900 text-red-300 p-4 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4">
            {' '}
            <h3 className="text-lg font-medium text-white">
              Career Information
            </h3>
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-300"
              >
                Career Title*
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white sm:text-sm"
                placeholder="e.g., Cybersecurity Analyst"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300"
              >
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white sm:text-sm"
                placeholder="Describe the career path and main responsibilities"
                required
              />
            </div>
          </div>
          <div className="space-y-4">
            {' '}
            <h3 className="text-lg font-medium text-white">
              Required Subjects
            </h3>
            <div>
              <label
                htmlFor="mustLearn"
                className="block text-sm font-medium text-gray-300"
              >
                Must Learn Subjects*
                <span className="text-xs text-gray-500 ml-1">
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                id="mustLearn"
                name="mustLearn"
                value={mustLearnInput}
                onChange={(e) =>
                  handleSubjectsChange(
                    e.target.value,
                    setMustLearnInput,
                    'mustLearnSubjects'
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white sm:text-sm"
                placeholder="e.g., Computer Science, Network Security, Cryptography"
                required
              />
              {formData.mustLearnSubjects &&
                formData.mustLearnSubjects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.mustLearnSubjects.map((subject, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-200"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
            </div>
            <div>
              <label
                htmlFor="shouldLearn"
                className="block text-sm font-medium text-gray-300"
              >
                Should Learn Subjects
                <span className="text-xs text-gray-500 ml-1">
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                id="shouldLearn"
                name="shouldLearn"
                value={shouldLearnInput}
                onChange={(e) =>
                  handleSubjectsChange(
                    e.target.value,
                    setShouldLearnInput,
                    'shouldLearnSubjects'
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white sm:text-sm"
                placeholder="e.g., Risk Management, Database Security, Ethical Hacking"
              />
              {formData.shouldLearnSubjects &&
                formData.shouldLearnSubjects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.shouldLearnSubjects.map((subject, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-900 text-amber-200"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
            </div>
            <div>
              <label
                htmlFor="canLearn"
                className="block text-sm font-medium text-gray-300"
              >
                Can Learn Subjects
                <span className="text-xs text-gray-500 ml-1">
                  (comma-separated)
                </span>
              </label>
              <input
                type="text"
                id="canLearn"
                name="canLearn"
                value={canLearnInput}
                onChange={(e) =>
                  handleSubjectsChange(
                    e.target.value,
                    setCanLearnInput,
                    'canLearnSubjects'
                  )
                }
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white sm:text-sm"
                placeholder="e.g., Digital Forensics, Cloud Security, IoT Security"
              />
              {formData.canLearnSubjects &&
                formData.canLearnSubjects.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.canLearnSubjects.map((subject, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900 text-green-200"
                      >
                        {subject}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          </div>
          <div className="space-y-4">
            {' '}
            <h3 className="text-lg font-medium text-white">Your Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="submitterName"
                  className="block text-sm font-medium text-gray-300"
                >
                  Your Name*
                </label>
                <input
                  type="text"
                  id="submitterName"
                  name="submitterName"
                  value={formData.submitterName}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white sm:text-sm"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="submitterEmail"
                  className="block text-sm font-medium text-gray-300"
                >
                  Your Email*
                </label>
                <input
                  type="email"
                  id="submitterEmail"
                  name="submitterEmail"
                  value={formData.submitterEmail}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white sm:text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="additionalNotes"
                className="block text-sm font-medium text-gray-300"
              >
                Additional Notes
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 text-white sm:text-sm"
                placeholder="Any additional information about this career pathway"
              />
            </div>
          </div>
          <div className="flex justify-end space-x-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-200 bg-gray-700 border border-gray-500 rounded-md shadow-sm hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-800"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-500 border border-transparent rounded-md shadow-sm hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Submitting...
                </>
              ) : (
                'Submit Contribution'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ContributionForm;
