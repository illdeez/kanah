import type { Metadata, Viewport } from "next";
import { Markazi_Text } from "next/font/google";
import "./globals.css";
import SplashScreen from "@/components/SplashScreen";

// One family everywhere (Greta Text Arabic is commercial; Markazi Text is the
// design's specified fallback and what the artboards render with).
const markazi = Markazi_Text({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-markazi",
  display: "swap",
});

export const metadata: Metadata = {
  title: "كَنْه",
  description: "الكلمة أعمق مما تظن",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#F1EADB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

// Default theme is LIGHT (IVORY).
const themeScript = `(function(){try{var t=localStorage.getItem("kanah-theme");if(t!=="light"&&t!=="dark")t="light";document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme="light";}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${markazi.variable} font-sans bg-kanah-bg text-kanah-text`}
      >
        <SplashScreen />
        <div className="kanah-ambient" />
        <div className="min-h-[100dvh] max-w-md mx-auto relative">
          {children}
        </div>
      </body>
    </html>
  );
}
