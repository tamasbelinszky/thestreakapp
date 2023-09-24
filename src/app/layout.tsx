import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import { Suspense } from "react";

import AuthContext from "./AuthContext";
import { PHProvider, PostHogPageview } from "./PostHog";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "The Streak App | Streaks Unleashed!",
  description: "Create streaks and track your progress. How long can you go?",
  applicationName: "thestreakapp",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://thestreakapp.com",
    description: "Create streaks and track your progress. How long can you go?",
    images: [
      {
        url: "https://thestreakapp.com/opengraph-image.png",
        width: 1000,
        height: 550,
        alt: "thestreakapp_logo",
      },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <Suspense>
        <Script id="google-tag-manager">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${process.env.NEXT_PUBLIC_GTM_CONTAINER_ID}')`}
        </Script>
        <PostHogPageview />
      </Suspense>
      <PHProvider>
        <body className={inter.className}>
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${process.env.NEXT_PUBLIC_GTM_CONTAINER_ID}`}
              height="0"
              width="0"
              className="invisible hidden"
            ></iframe>
          </noscript>
          <main className="flex min-h-screen w-full flex-col p-4 lg:p-8">
            <AuthContext>{children}</AuthContext>
          </main>
        </body>
      </PHProvider>
    </html>
  );
}
