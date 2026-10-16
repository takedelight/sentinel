import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ["@sentinel/ui"],
  agentRules: false,
};

export default nextConfig;
