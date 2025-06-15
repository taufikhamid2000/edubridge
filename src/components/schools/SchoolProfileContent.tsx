import React from 'react';
import Link from 'next/link';
import { School, SchoolStats } from '@/types/schools';

interface SchoolProfileContentProps {
  school: School & {
    stats: SchoolStats;
    teacherCount: number;
    studentCount: number;
    topStudents: Array<{
      id: string;
      full_name: string;
      total_points: number;
      total_correct_answers: number;
      total_quizzes_completed: number;
    }>;
  };
}

export default function SchoolProfileContent({
  school,
}: SchoolProfileContentProps) {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <nav className="flex mb-4" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li>
              <Link
                href="/leaderboard/schools"
                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
              >
                Schools
              </Link>
            </li>
            <li>
              <span className="text-gray-400 dark:text-gray-500 mx-2">/</span>
            </li>
            <li>
              <span className="text-gray-400 dark:text-gray-500">
                {school.name}
              </span>
            </li>
          </ol>
        </nav>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          {school.name}
        </h1>
        <div className="mt-2 flex items-center">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            {school.type}
          </span>
          <span className="mx-2 text-gray-400">•</span>
          <span className="text-gray-400 dark:text-gray-600">
            {school.district}, {school.state}
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-gray-800 dark:bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500">
            Average Score
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {school.stats?.average_score?.toFixed(1) ?? 'N/A'}
            {school.stats?.average_score ? '%' : ''}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <div
              className={`h-2 w-full rounded-full ${
                school.stats?.average_score >= 90
                  ? 'bg-green-500'
                  : school.stats?.average_score >= 80
                    ? 'bg-blue-500'
                    : school.stats?.average_score >= 70
                      ? 'bg-yellow-500'
                      : 'bg-gray-500'
              }`}
            />
          </div>
        </div>
        <div className="bg-gray-800 dark:bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500">
            Student Population
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {school.studentCount?.toLocaleString() ?? 'N/A'}
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-600">
            {school.teacherCount} teachers
          </p>
        </div>
        <div className="bg-gray-800 dark:bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500">
            Participation Rate
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {school.stats?.participation_rate?.toFixed(1) ?? 'N/A'}
            {school.stats?.participation_rate ? '%' : ''}
          </p>
          <div className="mt-2 flex items-center text-sm">
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full"
                style={{
                  width: `${school.stats?.participation_rate}%`,
                }}
              />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 dark:bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500">
            Total Quizzes Taken
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-gray-100">
            {school.stats?.total_quizzes_taken.toLocaleString()}
          </p>
          <p className="mt-2 text-sm text-gray-400 dark:text-gray-600">
            {(
              ((school.stats?.correct_answers || 0) /
                (school.stats?.total_questions_answered || 1)) *
              100
            ).toFixed(1)}
            % correct answers
          </p>
        </div>{' '}
      </div>

      {/* Hall of Fame */}
      <div className="bg-gray-800 dark:bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          Hall of Fame
        </h2>
        {school.topStudents.length > 0 ? (
          <div className="grid gap-4">
            {school.topStudents.map((student, index) => (
              <div
                key={student.id}
                className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700"
              >
                <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-300">
                    #{index + 1}
                  </span>
                </div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {student.full_name}
                  </h3>
                  <div className="mt-1 text-sm text-gray-400 dark:text-gray-600">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mr-2">
                      {student.total_points.toLocaleString()} points
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {student.total_quizzes_completed} quizzes completed
                    </span>
                  </div>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {(
                      (student.total_correct_answers /
                        (student.total_quizzes_completed * 10)) *
                      100
                    ).toFixed(1)}
                    %
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    accuracy
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 dark:text-gray-500 text-center py-4">
            No students have completed any quizzes yet.
          </p>
        )}
      </div>

      {/* School Details */}
      <div className="bg-gray-800 dark:bg-white rounded-lg shadow-sm p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
          School Information
        </h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">
              Contact Information
            </h3>
            <dl className="space-y-2">
              {school.phone && (
                <div>
                  <dt className="text-sm text-gray-400 dark:text-gray-500">
                    Phone
                  </dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {school.phone}
                  </dd>
                </div>
              )}
              {school.website && (
                <div>
                  <dt className="text-sm text-gray-400 dark:text-gray-500">
                    Website
                  </dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    <a
                      href={school.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {school.website}
                    </a>
                  </dd>
                </div>
              )}
              {school.address && (
                <div>
                  <dt className="text-sm text-gray-400 dark:text-gray-500">
                    Address
                  </dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {school.address}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-400 dark:text-gray-500 mb-2">
              Administration
            </h3>
            <dl className="space-y-2">
              {school.principal_name && (
                <div>
                  <dt className="text-sm text-gray-400 dark:text-gray-500">
                    Principal
                  </dt>
                  <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {school.principal_name}
                  </dd>
                </div>
              )}
              <div>
                <dt className="text-sm text-gray-400 dark:text-gray-500">
                  School Code
                </dt>
                <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {school.code || 'N/A'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
