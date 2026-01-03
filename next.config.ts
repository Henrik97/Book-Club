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
      {
        protocol: "https",
        hostname: "m.media-amazon.com",
      },
      {
        protocol: "https",
        hostname: "images-na.ssl-images-amazon.com",
      },
      {
        protocol: "https",
        hostname: "i.gr-assets.com",
      },
      {
        protocol: "https",
        hostname: "images.gr-assets.com",
      },
      {
        protocol: "https",
        hostname: "images.amazon.com",
      },
      {
        protocol: "https",
        hostname: "www.goodreads.com",
      },
    ],
  },
};

export default nextConfig;
