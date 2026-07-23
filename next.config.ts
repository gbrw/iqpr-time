import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Keep tracing scoped to this deployable folder.
  outputFileTracingRoot: process.cwd(),

  // Security headers are set in middleware.ts
  poweredByHeader: false,
  
  // Enable compression
  compress: true,
  
  // Redirect root /api to docs
  async redirects() {
    return [
      {
        source: '/api',
        destination: '/docs',
        permanent: false,
      },
    ]
  },
  
  // Headers for static files
  async headers() {
    return [
      {
        source: '/openapi.json',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Content-Type',
            value: 'application/json; charset=utf-8',
          },
        ],
      },
    ]
  },
}

export default nextConfig
