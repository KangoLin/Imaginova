import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { LocaleProvider } from "@/components/locale-provider";
import { ToastProvider } from "@/components/toast";
import { ErrorBoundary } from "@/components/error-boundary";
import { RouteProgress } from "@/components/route-progress";
import { Inter } from "next/font/google";
import { Suspense } from "react";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export async function generateMetadata(): Promise<Metadata> {
  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return {
    title: "Imaginova - AI Image & Video Generation Platform",
    description: "Generate stunning images and videos with AI. Free multimodal API for text-to-image, text-to-video, image-to-image, and image-to-video generation. Powered by Agnes AI.",
    keywords: ["AI image generation", "AI video generation", "text to image", "text to video", "AI art", "free API"],
    metadataBase: new URL(url),
    openGraph: {
      title: "Imaginova - AI Image & Video Generation",
      description: "Generate stunning images and videos with AI. No complex setup required.",
      type: "website",
      locale: "zh_CN",
      siteName: "Imaginova",
      url,
    },
    twitter: {
      card: "summary_large_image",
      title: "Imaginova - AI Image & Video Generation",
      description: "Generate stunning images and videos with AI. No complex setup required.",
    },
    robots: "index, follow",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
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
      <body className="min-h-dvh flex flex-col transition-theme">
        <Suspense fallback={null}>
          <RouteProgress />
        </Suspense>
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
