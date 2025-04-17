/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["bluestake.vercel.app", "imagedelivery.net"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Access-Control-Allow-Origin",
            value: "*",
          },
        ],
      },
    ];
  },
  allowedDevOrigins: ["daimo.ngrok.app", "localhost:3000"],
};

module.exports = nextConfig;
