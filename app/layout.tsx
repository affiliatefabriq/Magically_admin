import type { Metadata } from 'next';
import { QueryProvider } from './providers/QueryProvider';

import './globals.css';

export const metadata: Metadata = {
  title: 'Volshebny Admin',
  description: 'Admin Panel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
