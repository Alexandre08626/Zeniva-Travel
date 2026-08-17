import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

export const metadata: Metadata = {
  title: {
    default: 'Zenitech - Plateforme ZeniCorp',
    template: '%s | Zenitech',
  },
  description: 'CRM, Leads, IA, Contractors, Projets - Le cerveau technologique de ZeniCorp',
  keywords: ['CRM', 'construction', 'leads', 'contractors', 'IA', 'ZeniCorp', 'Zenitech'],
  authors: [{ name: 'ZeniCorp' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    url: 'https://zenitech.zenicorp.ca',
    siteName: 'Zenitech',
    title: 'Zenitech - Plateforme ZeniCorp',
    description: 'Le cerveau technologique de ZeniCorp',
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr-CA" className={`${inter.variable} ${playfair.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}