/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
   async redirects() {
    return [
      {
        source: '/',
        destination: '/employee-management',
        permanent: true, // 308 redirect
      },
    ]
  },
}

export default nextConfig
