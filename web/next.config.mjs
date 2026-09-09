/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/api/admin/migrate": ["./db/*.sql"],
  },
};

export default nextConfig;
