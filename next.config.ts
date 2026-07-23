import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "oaidalleapiprodscus.blob.core.windows.net" },
      { protocol: "https", hostname: "**.stability.ai" },
      { protocol: "https", hostname: "**.agnes-ai.space" },
      { protocol: "https", hostname: "platform-outputs.agnes-ai.space" },
    ],
  },
}

export default nextConfig
