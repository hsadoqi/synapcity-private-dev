import { Geist_Mono, Inter, Space_Grotesk } from "next/font/google"

import "@workspace/ui/globals.css"
import RootProviders from "./root-providers"
import { cn } from "@workspace/ui/lib/utils"

const spaceGroteskHeading = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-family-space-grotesk",
})

const inter = Inter({ subsets: ["latin"], variable: "--font-family-inter" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn(
        "light min-h-full w-full scroll-smooth antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable,
        spaceGroteskHeading.variable
      )}
    >
      <body className="flex min-h-full w-full flex-auto flex-col bg-background font-sans text-foreground antialiased">
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  )
}
