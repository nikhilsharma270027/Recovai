/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ⛔ disables ESLint check during `next build`
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "assets.aceternity.com",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/storage/:path*',
        destination: 'https://firebasestorage.googleapis.com/v0/b/freshdrink-b55c3.appspot.com/o/:path*',
      },
    ];
  },
};

export default nextConfig;