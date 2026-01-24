import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'NovaTok QR Hub',
  description: 'Dynamic QR codes for payments, crypto, and NFTs - Non-custodial',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
