import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Octa Byte Portfolio Dashboard',
  description: 'Real-time interactive investment portfolio tracking dashboard',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-900 text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
