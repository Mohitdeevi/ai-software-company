import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'PromptCorp OS | One Prompt → Production App',
  description:
    'Multi-agent AI platform that transforms a single prompt into a production-ready full-stack application with CI/CD, Docker, and Kubernetes.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} dark`}>
      <body className="font-sans">
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'rgba(17, 24, 39, 0.9)',
              backdropFilter: 'blur(12px)',
              color: '#f9fafb',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#f9fafb' },
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#f9fafb' },
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
