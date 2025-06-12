import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import ErrorBoundary from '@/components/ErrorBoundary';
import { validateEnvironment } from '@/lib/env-check';

// Validate environment variables on startup
validateEnvironment();

// Set proper viewport meta tag for mobile
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata = {
  title: 'EduBridge - Learn, Earn, Grow',
  description:
    'Empowering students and educators with tools to learn, earn and grow.',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#121212' },
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EduBridge',
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="color-scheme" content="light dark" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="h-full overflow-x-hidden">
        <Providers>
          <ErrorBoundary>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-1 w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 mobile-safe-bottom">
                {children}
              </main>
              <Footer />
            </div>
          </ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
