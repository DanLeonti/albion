/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "render.albiononline.com",
        pathname: "/v1/item/**",
      },
    ],
  },
};

module.exports = nextConfig;
