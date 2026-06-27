import type { Metadata, Viewport } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Sidebar from '@/components/Sidebar';
import Footer from '@/components/Footer';
import SearchOverlay from '@/components/SearchOverlay';
import Providers from '@/app/providers';

export const metadata: Metadata = {
  title: {
    default: 'Sports Stream — Watch Live Sports',
    template: '%s | Sports Stream',
  },
  description:
    'Stream live football, basketball, UFC, Formula 1, tennis, and boxing with multiple sources. Premium live sports streaming platform.',
  keywords: [
    'live sports streaming', 'watch football online', 'NBA live', 'UFC stream',
    'Formula 1 live', 'tennis live', 'Premier League stream', 'free sports streaming',
  ],
  authors: [{ name: 'Sports Stream' }],
  metadataBase: new URL('https://streamsport.pages.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://streamsport.pages.dev',
    siteName: 'Sports Stream',
    title: 'Sports Stream — Watch Live Sports',
    description: 'Premium live sports streaming — Football, Basketball, UFC, F1, Tennis, and Boxing.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Sports Stream' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sports Stream — Watch Live Sports',
    description: 'Premium live sports streaming platform.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: dark)',  color: '#090909' },
    { media: '(prefers-color-scheme: light)', color: '#f2f2f5' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://site.api.espn.com" />
        <link rel="dns-prefetch" href="https://www.thesportsdb.com" />
      </head>
      <body>
        <Providers>
          <Navbar />
          <Sidebar />
          <main
            className="min-h-screen page-with-sidebar"
            style={{ paddingTop: 'var(--nav-height)' }}
          >
            {children}
          </main>
          <Footer />
          <SearchOverlay />
        </Providers>
      </body>
    </html>
  );
}
