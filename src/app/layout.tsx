import type { Metadata } from 'next';
import { IBM_Plex_Sans, IBM_Plex_Mono, Roboto } from 'next/font/google';

import './globals.css';
import { cn } from '@/lib/utils';

const roboto = Roboto({subsets:['latin'],variable:'--font-sans'});

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-sans',
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-ibm-mono',
});

export const metadata: Metadata = {
  title: 'Void Portal',
  description: 'An interactive pixel gradient void',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn(ibmPlexSans.variable, ibmPlexMono.variable, 'font-sans', "font-sans", roboto.variable)}
    >
      <body>{children}</body>
    </html>
  );
}
