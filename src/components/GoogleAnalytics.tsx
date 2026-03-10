import Script from "next/script";

interface GoogleAnalyticsProps {
  /** Google Analytics 4 measurement ID (e.g. G-XXXXXXXXXX). Omit to disable. */
  analyticsId: string | null;
}

/**
 * Injects the Google Analytics 4 (gtag.js) script when analyticsId is set.
 * Configure the ID in Admin → Settings → Advanced → Google Analytics ID.
 */
export default function GoogleAnalytics({ analyticsId }: GoogleAnalyticsProps) {
  if (!analyticsId) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${analyticsId}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${analyticsId}');
        `}
      </Script>
    </>
  );
}
