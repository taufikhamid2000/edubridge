import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'EduBridge · Authentication',
  description: 'Sign in or create an account to access EduBridge',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
