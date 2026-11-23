import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [{ source: "/", destination: "/index.html" }];
  },
  async headers() {
    return [
      { source: "/sw.js", headers: [{ key: "Cache-Control", value: "no-cache" }, { key: "Service-Worker-Allowed", value: "/" }] },
      { source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex" }, { key: "Referrer-Policy", value: "same-origin" }] },
    ];
  },
};

export default nextConfig;
