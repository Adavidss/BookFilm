import type { Metadata } from 'next';
import './globals.css';
import Layout from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: 'ShowBook Recommender',
  description: 'Personal TV Show + Book Recommender',
  icons: {
    apple: 'https://www.kidsdc.org/BookFilm/BookFilmApp.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ShowBook',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ErrorBoundary>
          <Layout>{children}</Layout>
        </ErrorBoundary>
      </body>
    </html>
  );
}
