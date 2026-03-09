import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { CartProvider } from '@/hooks/use-cart';
import { NavigationProvider } from '@/hooks/use-navigation';
import { WhatsAppButton } from '@/components/whatsapp-button';
import { GoogleAnalytics } from '@/components/google-analytics';

const siteConfig = {
  name: 'SAAH Tontine',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://saahbusiness.com',
  description: 'SAAH Tontine : La solution moderne pour votre épargne collective. Sécurité, transparence et flexibilité pour vos projets futurs.',
  keywords: ['tontine', 'épargne collective', 'saah tontine', 'finance solidaire', 'épargne groupe', 'tontine en ligne'],
  author: 'SAAH Business',
};

export const viewport: Viewport = {
  themeColor: '#ffca28',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Épargne Collaborative & Tontine`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  manifest: '/manifest.json',
  verification: {
    google: "umD5CFzVjUKaJOB7332Ff9goK21qwd-BnGiIf7czGZE",
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteConfig.url,
    title: `${siteConfig.name} - Votre Épargne en Groupe`,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: `Logo de ${siteConfig.name}`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} - Épargne Collaborative`,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og-image.png`],
    creator: '@saahbusiness',
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  }
};

const fontInter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'SAAH Tontine',
    url: siteConfig.url,
    logo: `${siteConfig.url}/logo.png`,
    description: siteConfig.description,
    sameAs: [
      'https://www.facebook.com/saahbusiness',
      'https://www.tiktok.com/@saahbusiness',
      'https://www.instagram.com/saahbusiness',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+228-90-10-13-92',
      contactType: 'customer service',
      areaServed: "TG",
      availableLanguage: ["French"]
    }
  };

  return (
    <html lang="fr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontInter.variable
        )}
      >
        {process.env.NEXT_PUBLIC_GOOGLE_ADS_ID && <GoogleAnalytics />}
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationProvider>
            <CartProvider>
                <div className="relative flex min-h-screen flex-col">
                  <Header />
                  <main className="flex-1">{children}</main>
                  <Footer />
                </div>
                <WhatsAppButton />
                <Toaster />
            </CartProvider>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}