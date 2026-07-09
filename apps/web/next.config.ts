import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  turbopack: {
    root: "/Users/hanaasadoqi/Development/projects/synapcity-private-dev/synapcity-theme"
  }
}

export default nextConfig
