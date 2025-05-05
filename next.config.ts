import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* for first version without eslint and typescript warnings */
    eslint: {
        ignoreDuringBuilds: true,
    },
    typescript: {
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
