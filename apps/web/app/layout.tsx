import type { Metadata, Viewport } from "next"
import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google"
import { cn } from "@workspace/ui/lib/utils"
import { RootProviders } from "./root-providers"
import "./globals.css"

const spaceGroteskHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "Synapcity",
  description:
    "Personal knowledge, document, dashboard, and composition workspace",
  generator: "v0.app",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F9F7F4" },
    { media: "(prefers-color-scheme: dark)", color: "#0F0E0C" },
  ],
  userScalable: true,
  width: "device-width",
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={cn(
        "overflow-hidden bg-background text-foreground antialiased",
        geistMono.variable,
        "font-sans",
        inter.variable,
        spaceGroteskHeading.variable
      )}
    >
      <body className="flex h-full min-h-svh w-screen flex-1 flex-col">
        <RootProviders>{children}</RootProviders>
      </body>
      {/* {process.env.NODE_ENV === "production" && <Analytics />} */}
    </html>
  )
}
