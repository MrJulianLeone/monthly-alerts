/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/admin/migrate": ["./db/*.sql"],
  },
  async redirects() {
    return [
      // Marketing page briefly shipped under the Italy-specific URL.
      {
        source: "/renovating-in-italy",
        destination: "/renovating-abroad",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
