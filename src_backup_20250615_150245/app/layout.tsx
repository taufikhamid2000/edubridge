import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import ErrorBoundary from '@/components/ErrorBoundary';
import { validateEnvironment } from '@/lib/env-check';

// Validate environment variables on startup
validateEnvironment();

export const metadata = {
  title: 'EduBridge - Learn, Earn, Grow',
  description:
    'Empowering students and educators with tools to learn, earn and grow.',
};

// Fix the viewport warning by using the correct export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <ErrorBoundary>
            <Header />
            <main>{children}</main>
            <Footer />
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
