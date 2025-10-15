import './global.css';
import ClientProviders from '@/components/client-providers';

export const metadata = {
  title: 'DocuSeal App',
  description: 'Document management with DocuSeal API and Next.js',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ClientProviders>
          <main className="flex min-h-screen flex-col items-center justify-between p-24">
            {children}
          </main>
        </ClientProviders>
      </body>
    </html>
  );
}
