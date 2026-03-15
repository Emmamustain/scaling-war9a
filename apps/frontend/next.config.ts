import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const isCapacitorBuild = process.env.CAPACITOR_BUILD === "true";

const nextConfig: NextConfig = {
  ...(isCapacitorBuild
    ? {
        output: "export",
        trailingSlash: true,
      }
    : {
        output: "standalone",
      }),
  images: {
    unoptimized: true,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
};

export default withNextIntl(nextConfig);
