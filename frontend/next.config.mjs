import createNextIntlPlugin from "next-intl/plugin";

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "binn-oxar.onrender.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "api.qrserver.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.binancecoins.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "binancecoins.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "www.binancecoins.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "binancecoins.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "www.binancemg.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "binancemg.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "76.13.14.1",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "76.13.14.1",
        pathname: "/**",
      },
    ],
  },
  async rewrites() {
    const backendOrigin = (
      process.env.BACKEND_INTERNAL_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "https://binn-oxar.onrender.com"
    )
      .replace(/\/api\/v1\/?$/, "")
      .replace(/\/+$/, "");

    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendOrigin}/api/v1/:path*`,
      },
      {
        source: "/kyc/:path*",
        destination: `${backendOrigin}/kyc/:path*`,
      },
    ];
  },
};

const withNextIntl = createNextIntlPlugin("./i18n/request.js");

export default withNextIntl(nextConfig);
