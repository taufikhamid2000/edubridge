'use client';

import Link from 'next/link';

export default function RewardsSuccessPage() {
  return (
    <div className="container mx-auto px-4 py-16 text-center max-w-2xl">
      <div className="mb-8 text-6xl">🎉</div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        Reward Claim Submitted!
      </h1>
      <p className="text-gray-400 dark:text-gray-600 mb-8">
        Your reward claim has been successfully submitted. Our team will review
        your claim and process the payment within 5-7 working days. You can
        check the status of your claim in your profile.
      </p>
      <div className="flex justify-center gap-4">
        <Link
          href="/rewards"
          className="px-6 py-2 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          View All Rewards
        </Link>
        <Link
          href="/profile"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Check Claim Status
        </Link>
      </div>
    </div>
  );
}
