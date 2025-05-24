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
import dynamic from 'next/dynamic';

// Import PixelTracker using dynamic import with SSR disabled
const PixelTracker = dynamic(() => import('@/components/PixelTracker'), { ssr: false });

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
    icons: settings?.faviconUrl ? { icon: settings.faviconUrl } : '/favicon.ico',
    // Add Facebook domain verification meta tag using the 'other' property
    other: {
      'facebook-domain-verification': 'mi5w78rv8dtjio82vx0bzx7vi2cwls',
    },
    // You can add other metadata like open graph, twitter, etc.
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${montserrat.variable} ${roboto.variable} ${poppins.variable} ${robotoMono.variable}`}>
      <head>
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '1005322541746212');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1005322541746212&ev=PageView&noscript=1"
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body className={`antialiased`}>
        <PixelTracker />
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
