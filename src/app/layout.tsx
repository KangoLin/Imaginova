import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { ToastProvider } from "@/components/toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Imaginova - AI Image & Video Generation Platform",
  description: "Generate stunning images and videos with AI. Free multimodal API for text-to-image, text-to-video, image-to-image, and image-to-video generation. Powered by Agnes AI.",
  keywords: ["AI image generation", "AI video generation", "text to image", "text to video", "AI art", "free API"],
  openGraph: {
    title: "Imaginova - AI Image & Video Generation",
    description: "Generate stunning images and videos with AI. No complex setup required.",
    type: "website",
    locale: "en_US",
    siteName: "Imaginova",
  },
  twitter: {
    card: "summary_large_image",
    title: "Imaginova - AI Image & Video Generation",
    description: "Generate stunning images and videos with AI. No complex setup required.",
  },
  robots: "index, follow",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var t = localStorage.getItem('theme');
                  if (t === 'dark' || (!t && matchMedia('(prefers-color-scheme:dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  }
                  var l = localStorage.getItem('imaginova-locale');
                  if (l === 'zh' || l === 'en') {
                    document.documentElement.lang = l;
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col transition-theme">
        <ErrorBoundary>
          <ThemeProvider>
            <LocaleProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </LocaleProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
