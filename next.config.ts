import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    ".space.z.ai",
    ".z.ai",
    "preview-chat-b0746bec-7231-4742-b29b-e7f9431856e2.space.z.ai",
    "192.168.111.211",
  ],
  // Note: instrumentation.ts is available by default in Next.js 16+
  // No need for experimental.instrumentationHook
};

export default nextConfig;
