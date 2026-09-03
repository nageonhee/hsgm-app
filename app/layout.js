import "./globals.css";
import { Providers } from "./providers";

export const metadata = {
  title: "HSGM — 스마트 가전 에너지 관리",
  description:
    "제조사별로 흩어진 가전 정보를 한곳에서 통합 관리. 전력 소모량, 소모품, A/S까지 하나의 앱으로.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HSGM",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko" suppressHydrationWarning className="h-full antialiased">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
