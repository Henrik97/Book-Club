import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ecxafswrboejxmdtinik.supabase.co",
        pathname: "/storage/v1/object/public/book-covers/**",
        port: "",
      },
    ],
  },
};

export default nextConfig;
