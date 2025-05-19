import './globals.css';
import type { Metadata } from 'next';
import { Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import ToastProvider from '@/components/ToastProvider';
import AuthProvider from './providers';
import SiteSettingsProvider from '@/components/SiteSettingsProvider';
import SiteStyleProvider from '@/components/SiteStyleProvider';
import { getSiteSettings } from '@/lib/settings';

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export async function generateMetadata(): Promise<Metadata> {
  // Fetch settings on the server for SEO purposes
  const settings = await getSiteSettings();
  
  return {
    title: settings?.siteName || 'Andaz E Nu - Premium T-Shirts & Apparel',
    description: 'Shop the latest collection of premium t-shirts and apparel.',
    icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : undefined,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistMono.variable} antialiased`}>
        <ToastProvider />
        <AuthProvider>
          <SiteSettingsProvider>
            <SiteStyleProvider>
              <main className="min-h-screen">
                {children}
              </main>
            </SiteStyleProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
