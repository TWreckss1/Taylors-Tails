import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname),
  // Cloudflare Workers can't run Firestore's Node build (gRPC/protobufjs use
  // runtime code generation, which workerd forbids). Force the fetch-based
  // browser build in the server bundle instead.
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
        "@firebase/firestore": path.resolve(
          __dirname,
          "node_modules/@firebase/firestore/dist/index.esm.js"
        ),
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
};

export default nextConfig;
