import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  transpilePackages: ["@workspace/ui"],
  turbopack: {
    root: path.join(__dirname, "../.."),
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "x-content-type-options",
            value: "nosniff",
          },
          {
            key: "referrer-policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ]
  },
}
export default nextConfig
