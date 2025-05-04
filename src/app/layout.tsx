import '../styles/globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/Providers';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata = {
  title: 'EduBridge',
  description: 'An educational platform',
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
