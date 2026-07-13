/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Since we are running Express on 5000 and Next.js on 3000, we don't need rewrites, 
  // but adding a redirect/rewrite helper makes API calling clean!
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:5000/api/:path*' // Proxy to Backend
      }
    ]
  }
};

export default nextConfig;
