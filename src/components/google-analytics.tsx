'use client'

import Script from 'next/script'

const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
const GOOGLE_ADS_CONVERSION_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_CONVERSION_ID;

export function GoogleAnalytics() {

  if (!GOOGLE_ADS_ID || !GOOGLE_ADS_CONVERSION_ID) {
    return null;
  }

  return (
    <>
      <Script
        async
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GOOGLE_ADS_ID}');
        `}
      </Script>
      <Script id="google-ads-conversion" strategy="afterInteractive">
        {`
            gtag('event', 'conversion', {
                'send_to': '${GOOGLE_ADS_CONVERSION_ID}',
                'transaction_id': ''
            });
        `}
      </Script>
    </>
  )
}
