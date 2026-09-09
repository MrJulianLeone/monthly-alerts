import Script from "next/script";

/**
 * Google Ads tag and Meta Pixel, each rendered only when its ID is set in
 * the environment — so nothing loads until the ad accounts exist:
 *   NEXT_PUBLIC_GOOGLE_ADS_ID=AW-XXXXXXXXX
 *   NEXT_PUBLIC_GOOGLE_ADS_ACTIVATION_LABEL=<conversion label>  (optional)
 *   NEXT_PUBLIC_GOOGLE_ADS_SIGNUP_LABEL=<conversion label>      (optional)
 *   NEXT_PUBLIC_META_PIXEL_ID=XXXXXXXXXXXXXXX
 * Conversion events are sent from lib/analytics.ts.
 */
export function AdPixels() {
  const gads = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
  const meta = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  if (!gads && !meta) return null;
  return (
    <>
      {gads && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gads)}`}
            strategy="afterInteractive"
          />
          <Script id="gtag-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${gads}');`}
          </Script>
        </>
      )}
      {meta && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${meta}');fbq('track','PageView');`}
        </Script>
      )}
    </>
  );
}
