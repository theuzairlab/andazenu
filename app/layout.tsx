import './globals.css';
import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import { Roboto_Mono } from 'next/font/google';
import { Montserrat, Roboto } from 'next/font/google';
import ToastProvider from '@/components/ToastProvider';
import AuthProvider from './providers';
import SiteSettingsProvider from '@/components/SiteSettingsProvider';
import SiteStyleProvider from '@/components/SiteStyleProvider';
import { getSiteSettings } from '@/lib/settings';

const montserrat = Montserrat({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-sans',
});

const roboto = Roboto({
  subsets: ['latin'],
  weight: ['300', '400', '500', '700'],
  variable: '--font-body',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const robotoMono = Roboto_Mono({  // Changed from geistMono
  subsets: ['latin'],
  variable: '--font-mono', // You may want to change this variable name
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${roboto.variable} ${poppins.variable} ${robotoMono.variable}`}>
      <body className={`antialiased`}>
        <ToastProvider />
        <AuthProvider>
          <SiteSettingsProvider>
            <SiteStyleProvider>
              <main className="min-h-screen">{children}</main>
            </SiteStyleProvider>
          </SiteSettingsProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
