import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { protocol: "https", hostname: "**.stability.ai" },
      { protocol: "https", hostname: "**.agnes-ai.space" },
    ],
  },
}

export default nextConfig
