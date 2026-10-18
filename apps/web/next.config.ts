import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@sentinel/ui", "@sentinel/auth"],
  agentRules: false,
};

export default nextConfig;
