'use client';

import { FC, useState, useEffect } from 'react';
import { PathwayContribution } from '../types';
import { supabase } from '@/lib/supabase';

// Mock submission function (to be implemented with real API later)
const submitPathwayContribution = async (
  contribution: PathwayContribution
): Promise<{ success: boolean; error?: string }> => {
  // This is a mock implementation that always succeeds
  // In a real implementation, this would make an API call
  console.log('Submitting pathway contribution:', contribution);

  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { success: true };
};

interface ContributionFormProps {
  onSubmitSuccess?: () => void;
  onCancel?: () => void;
}

const ContributionForm: FC<ContributionFormProps> = ({
  onSubmitSuccess,
  onCancel,
}) => {
  // Form state
  const [formData, setFormData] = useState<Partial<PathwayContribution>>({
    career: '',
    description: '',
    preUniversityOptions: [],
    bachelorOptions: [],
    advancedOptions: [],
    certifications: [],
    additionalNotes: '',
    submitterName: '',
    submitterEmail: '',
  });

  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Form submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Dynamic input fields
  const [preUInput, setPreUInput] = useState('');
  const [bachelorInput, setBachelorInput] = useState('');
  const [advancedInput, setAdvancedInput] = useState('');
  const [certInput, setCertInput] = useState('');

  // Check if user is logged in
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Error checking auth status:', error);
          setIsLoggedIn(false);
          return;
        }

        if (data.session) {
          setIsLoggedIn(true);

          // Get user details
          const { user } = data.session;
          setUserEmail(user.email || null);

          // Use email name as display name if available, otherwise use metadata
          if (user.email) {
            const namePart = user.email.split('@')[0];
            const formattedName =
              namePart.charAt(0).toUpperCase() + namePart.slice(1);
            setUserName(formattedName);
          }

          // If user data is available in user metadata, use it
          if (user.user_metadata) {
            if (user.user_metadata.name) {
              setUserName(user.user_metadata.name);
            } else if (user.user_metadata.full_name) {
              setUserName(user.user_metadata.full_name);
            }
          }
        } else {
          setIsLoggedIn(false);
          setUserEmail(null);
          setUserName(null);
        }
      } catch (err) {
        console.error('Error in authentication check:', err);
        setIsLoggedIn(false);
      }
    }

    checkAuthStatus();

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        setIsLoggedIn(true);
        setUserEmail(session.user.email || null);

        // Set name based on available data
        if (session.user.user_metadata?.name) {
          setUserName(session.user.user_metadata.name);
        } else if (session.user.user_metadata?.full_name) {
          setUserName(session.user.user_metadata.full_name);
        } else if (session.user.email) {
          const namePart = session.user.email.split('@')[0];
          const formattedName =
            namePart.charAt(0).toUpperCase() + namePart.slice(1);
          setUserName(formattedName);
        }
      } else if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false);
        setUserEmail(null);
        setUserName(null);
      }
    });

    // Clean up on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Handle adding an item to a string array in form data
  const handleAddItem = (
    field:
      | 'preUniversityOptions'
      | 'bachelorOptions'
      | 'advancedOptions'
      | 'certifications',
    value: string,
    setValue: React.Dispatch<React.SetStateAction<string>>
  ) => {
    if (value.trim()) {
      setFormData((prev) => ({
        ...prev,
        [field]: [...(prev[field] || []), value.trim()],
      }));
      setValue(''); // Clear input field
    }
  };

  // Handle removing an item from a string array in form data
  const handleRemoveItem = (
    field:
      | 'preUniversityOptions'
      | 'bachelorOptions'
      | 'advancedOptions'
      | 'certifications',
    index: number
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index),
    }));
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
      const updatedFormData = { ...formData };

      // Handle anonymous contributions
      if (isAnonymous) {
        // For anonymous contributions, store a placeholder name
        updatedFormData.submitterName = 'Anonymous Contributor';

        // If logged in, still store their email for admin purposes
        if (isLoggedIn && userEmail) {
          updatedFormData.submitterEmail = userEmail;
        }
      } else {
        // For non-anonymous contributions from logged-in users, use their account info
        if (isLoggedIn) {
          if (userName) {
            updatedFormData.submitterName = userName;
          }
          if (userEmail) {
            updatedFormData.submitterEmail = userEmail;
          }
        }
      }

      setFormData(updatedFormData);

      // Basic validation
      if (!formData.career || !formData.description) {
        throw new Error('Please provide a career title and description.');
      }

      // Check for submitter info only if not logged in and not anonymous
      if (
        !isLoggedIn &&
        !isAnonymous &&
        (!formData.submitterName || !formData.submitterEmail)
      ) {
        throw new Error(
          'Please provide your name and email or choose to contribute anonymously.'
        );
      }

      if ((formData.preUniversityOptions?.length || 0) === 0) {
        throw new Error('Please provide at least one pre-university option.');
      }

      if ((formData.bachelorOptions?.length || 0) === 0) {
        throw new Error('Please provide at least one bachelor degree option.');
      }

      // Submit the form data
      const result = await submitPathwayContribution(
        formData as PathwayContribution
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

  // Component to render array items with delete button
  const ArrayItems = ({
    items,
    onRemove,
    label,
    colorClass = 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200',
  }: {
    items: string[];
    onRemove: (index: number) => void;
    label: string;
    colorClass?: string;
  }) => (
    <div className="mt-2">
      {items.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {items.map((item, index) => (
            <span
              key={index}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${colorClass}`}
            >
              {item}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
              >
                <span className="sr-only">Remove {item}</span>
                <svg
                  className="h-3 w-3 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No {label} added yet
        </p>
      )}
    </div>
  );
  return (
    <div className="bg-gray-800 dark:bg-white shadow-lg rounded-lg p-6 max-w-3xl mx-auto border border-gray-700 dark:border-gray-200">
      <h2 className="text-2xl font-bold text-white dark:text-gray-900 mb-6">
        Contribute an Education Pathway
      </h2>
      {success ? (
        <div className="bg-green-950 border border-green-900 text-green-300 p-4 rounded-md mb-6">
          <p className="font-medium">Thank you for your contribution!</p>
          <p className="mt-1">
            Our team will review your submission and add it to our education
            pathways if approved. You&apos;ll receive an email notification when
            the review is complete.
          </p>
          <button
            onClick={() => {
              setSuccess(false);
              setFormData({
                career: '',
                description: '',
                preUniversityOptions: [],
                bachelorOptions: [],
                advancedOptions: [],
                certifications: [],
                additionalNotes: '',
                submitterName: '',
                submitterEmail: '',
              });
            }}
            className="mt-3 text-sm font-medium text-green-400 hover:text-green-200"
          >
            Submit another contribution
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-950 border border-red-900 text-red-300 p-4 rounded-md">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white dark:text-gray-900">
              Career Information
            </h3>
            <div>
              <label
                htmlFor="career"
                className="block text-sm font-medium text-gray-300 dark:text-gray-700"
              >
                Career Title*
              </label>
              <input
                type="text"
                id="career"
                name="career"
                value={formData.career}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 dark:bg-white text-white dark:text-gray-900 sm:text-sm"
                placeholder="e.g., Software Engineer, Medical Doctor"
                required
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300 dark:text-gray-700"
              >
                Description*
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 dark:bg-white text-white dark:text-gray-900 sm:text-sm"
                placeholder="Describe the career path and main responsibilities"
                required
              />
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white dark:text-gray-900">
              Educational Pathway
            </h3>

            {/* Pre-University Options */}
            <div>
              <label
                htmlFor="preUniversityOptions"
                className="block text-sm font-medium text-gray-300 dark:text-gray-700"
              >
                Pre-University Options*
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="preUniversityOptions"
                  value={preUInput}
                  onChange={(e) => setPreUInput(e.target.value)}
                  className="flex-1 min-w-0 block w-full rounded-l-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 dark:bg-white text-white dark:text-gray-900 sm:text-sm"
                  placeholder="e.g., STPM, Foundation in Science, A-Levels"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddItem(
                      'preUniversityOptions',
                      preUInput,
                      setPreUInput
                    )
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white"
                >
                  Add
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                Add pre-university program options for this career path
              </p>
              <ArrayItems
                items={formData.preUniversityOptions || []}
                onRemove={(index) =>
                  handleRemoveItem('preUniversityOptions', index)
                }
                label="pre-university options"
                colorClass="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
              />
            </div>

            {/* Bachelor Options */}
            <div>
              <label
                htmlFor="bachelorOptions"
                className="block text-sm font-medium text-gray-300 dark:text-gray-700"
              >
                Bachelor Degree Options*
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="bachelorOptions"
                  value={bachelorInput}
                  onChange={(e) => setBachelorInput(e.target.value)}
                  className="flex-1 min-w-0 block w-full rounded-l-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 dark:bg-white text-white dark:text-gray-900 sm:text-sm"
                  placeholder="e.g., Bachelor of Computer Science, Bachelor of Medicine"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddItem(
                      'bachelorOptions',
                      bachelorInput,
                      setBachelorInput
                    )
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white"
                >
                  Add
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                Add bachelor degree options for this career path
              </p>
              <ArrayItems
                items={formData.bachelorOptions || []}
                onRemove={(index) => handleRemoveItem('bachelorOptions', index)}
                label="bachelor options"
                colorClass="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
              />
            </div>

            {/* Advanced Degree Options */}
            <div>
              <label
                htmlFor="advancedOptions"
                className="block text-sm font-medium text-gray-300 dark:text-gray-700"
              >
                Advanced Degree Options (Optional)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="advancedOptions"
                  value={advancedInput}
                  onChange={(e) => setAdvancedInput(e.target.value)}
                  className="flex-1 min-w-0 block w-full rounded-l-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 dark:bg-white text-white dark:text-gray-900 sm:text-sm"
                  placeholder="e.g., Master of Computer Science, PhD in AI"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddItem(
                      'advancedOptions',
                      advancedInput,
                      setAdvancedInput
                    )
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white"
                >
                  Add
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                Add any advanced degree options (Master&apos;s/PhD)
              </p>
              <ArrayItems
                items={formData.advancedOptions || []}
                onRemove={(index) => handleRemoveItem('advancedOptions', index)}
                label="advanced options"
                colorClass="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200"
              />
            </div>

            {/* Professional Certifications */}
            <div>
              <label
                htmlFor="certifications"
                className="block text-sm font-medium text-gray-300 dark:text-gray-700"
              >
                Professional Certifications (Optional)
              </label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  id="certifications"
                  value={certInput}
                  onChange={(e) => setCertInput(e.target.value)}
                  className="flex-1 min-w-0 block w-full rounded-l-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 dark:bg-white text-white dark:text-gray-900 sm:text-sm"
                  placeholder="e.g., AWS Certified Solutions Architect, CFA"
                />
                <button
                  type="button"
                  onClick={() =>
                    handleAddItem('certifications', certInput, setCertInput)
                  }
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-r-md bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 text-white"
                >
                  Add
                </button>
              </div>
              <p className="mt-1 text-sm text-gray-400 dark:text-gray-500">
                Add any relevant professional certifications
              </p>
              <ArrayItems
                items={formData.certifications || []}
                onRemove={(index) => handleRemoveItem('certifications', index)}
                label="certifications"
                colorClass="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white dark:text-gray-900">
              {isLoggedIn ? 'Submitter Information' : 'Your Information'}
            </h3>

            {isLoggedIn ? (
              // Show user info summary card when logged in
              <div className="space-y-4">
                <div className="bg-gray-700 dark:bg-gray-100 rounded-md p-4 border border-gray-600 dark:border-gray-300">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {userName ? userName.charAt(0).toUpperCase() : '?'}
                      </span>
                    </div>
                    <div className="ml-4">
                      <p className="text-white dark:text-gray-800 font-medium">
                        {userName || 'User'}
                      </p>
                      <p className="text-gray-400 dark:text-gray-500 text-sm">
                        {userEmail || 'Authenticated user'}
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-gray-400 dark:text-gray-500">
                    Your contribution will be submitted with your account
                    information.
                  </p>
                </div>

                <div className="flex items-start mt-4">
                  <div className="flex items-center h-5">
                    <input
                      id="anonymous"
                      name="anonymous"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-500 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="anonymous"
                      className="text-gray-300 dark:text-gray-700 cursor-pointer"
                    >
                      Contribute anonymously
                    </label>
                    <p className="text-gray-400 dark:text-gray-500">
                      Your name and email will not be publicly associated with
                      this contribution.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              // Show input fields only for non-logged in users
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="submitterName"
                      className="block text-sm font-medium text-gray-300 dark:text-gray-700"
                    >
                      Your Name*
                    </label>
                    <input
                      type="text"
                      id="submitterName"
                      name="submitterName"
                      value={formData.submitterName}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 dark:bg-white text-white dark:text-gray-900 sm:text-sm"
                      required={!isAnonymous}
                      disabled={isAnonymous}
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="submitterEmail"
                      className="block text-sm font-medium text-gray-300 dark:text-gray-700"
                    >
                      Your Email*
                    </label>
                    <input
                      type="email"
                      id="submitterEmail"
                      name="submitterEmail"
                      value={formData.submitterEmail}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 dark:bg-white text-white dark:text-gray-900 sm:text-sm"
                      required={!isAnonymous}
                      disabled={isAnonymous}
                    />
                  </div>
                </div>

                <div className="flex items-start mt-3">
                  <div className="flex items-center h-5">
                    <input
                      id="anonymous"
                      name="anonymous"
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={(e) => setIsAnonymous(e.target.checked)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-500 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label
                      htmlFor="anonymous"
                      className="text-gray-300 dark:text-gray-700 cursor-pointer"
                    >
                      Contribute anonymously
                    </label>
                    <p className="text-gray-400 dark:text-gray-500">
                      Your contribution will be submitted anonymously. We still
                      need a contact email for moderation purposes, but it
                      won&apos;t be publicly displayed.
                    </p>
                  </div>
                </div>
              </>
            )}

            <div>
              <label
                htmlFor="additionalNotes"
                className="block text-sm font-medium text-gray-300 dark:text-gray-700"
              >
                Additional Notes
              </label>
              <textarea
                id="additionalNotes"
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 bg-gray-700 dark:bg-white text-white dark:text-gray-900 sm:text-sm"
                placeholder="Any additional information about this educational pathway"
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
