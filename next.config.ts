import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Allow mobile devices on the same network to access dev resources */
  allowedDevOrigins: ['192.168.1.107', 'localhost:3000'],
};

export default nextConfig;
