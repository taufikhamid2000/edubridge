import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'School Rankings | EduBridge',
  description:
    'View top performing schools in EduBridge platform across different categories and regions',
};

export default function SchoolLeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
