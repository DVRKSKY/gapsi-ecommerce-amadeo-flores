import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AppProviders } from "./providers";
import { APP_NAME } from "@/shared/constants/app";
import { SEO_DEFAULT_DESCRIPTION, SEO_KEYWORDS, SEO_DEFAULT_TITLE, THEME_COLOR_DARK, THEME_COLOR_LIGHT } from "@/shared/constants/seo";
import { getSiteOrigin } from "@/shared/lib/site-url";
import { SiteFooter } from "@/shared/ui/organisms/site-footer";

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: THEME_COLOR_LIGHT },
    { media: "(prefers-color-scheme: dark)", color: THEME_COLOR_DARK },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: getSiteOrigin(),
  applicationName: APP_NAME,
  title: {
    default: SEO_DEFAULT_TITLE,
    template: `%s · ${APP_NAME}`,
  },
  description: SEO_DEFAULT_DESCRIPTION,
  keywords: [...SEO_KEYWORDS],
  authors: [{ name: "Amadeo Flores" }],
  creator: "Amadeo Flores",
  publisher: APP_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png", sizes: "512x512" }],
    apple: [{ url: "/icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: ["/icon.png"],
  },
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: APP_NAME,
    statusBarStyle: "default",
  },
  alternates: {
    canonical: "/",
  },
  category: "ecommerce",
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "es_MX",
    alternateLocale: ["es_ES", "es"],
    url: "/",
    siteName: APP_NAME,
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    images: [
      {
        url: "/logo.png",
        alt: APP_NAME,
        type: "image/png",
      },
      {
        url: "/icon.png",
        alt: `${APP_NAME} ícono`,
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SEO_DEFAULT_TITLE,
    description: SEO_DEFAULT_DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es-MX">
      <body className="flex min-h-dvh flex-col antialiased">
        <AppProviders>
          <div className="flex min-h-dvh flex-1 flex-col">
            <div className="flex min-h-0 flex-1 flex-col">{children}</div>
            <SiteFooter />
          </div>
        </AppProviders>
      </body>
    </html>
  );
}
