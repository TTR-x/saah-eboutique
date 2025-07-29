
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import { ThemeProvider } from '@/components/theme-provider';
import { CartProvider } from '@/hooks/use-cart';
import { NavigationProvider } from '@/hooks/use-navigation';

const siteConfig = {
  name: 'SAAH Business',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://saahbusiness.com',
  description: 'SAAH Business : Votre boutique en ligne de confiance pour le high-tech, la mode, la maison et l’artisanat. Découvrez des produits de qualité, un service client exceptionnel et des offres exclusives. Achetez maintenant sur SAAH Business.',
  keywords: ['saah', 'saahbusiness', 'saah business', 'e-commerce saah', 'shopping en ligne saah', 'acheter en ligne', 'high-tech', 'mode', 'maison', 'artisanat', 'produits importés chine'],
  author: 'SAAH Business',
};


export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - Boutique en Ligne High-Tech, Mode & Maison`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author, url: siteConfig.url }],
  creator: siteConfig.author,
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: siteConfig.url,
    title: `${siteConfig.name} - Boutique en Ligne`,
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
    title: `${siteConfig.name} - Boutique en Ligne`,
    description: siteConfig.description,
    images: [`${siteConfig.url}/og-image.png`],
    creator: '@saahbusiness',
  },
  icons: {
    icon: '/favicon.ico',
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
    name: 'SAAH Business',
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

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: {
      '@type': 'Organization',
      name: siteConfig.name,
      logo: {
        '@type': 'ImageObject',
        url: `${siteConfig.url}/logo.png`,
      },
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteConfig.url}/products?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
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
         <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body
        className={cn(
          'min-h-screen bg-background font-body antialiased',
          fontInter.variable
        )}
      >
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
                <Toaster />
            </CartProvider>
          </NavigationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
