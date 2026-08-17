/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@zenicorp/shared-types',
    '@zenicorp/zenitech-core',
    '@zenicorp/zenicorp-core',
  ],
  images: {
    domains: ['localhost', 'zenicorp.ca', 'cdn.zenicorp.ca', 'lh3.googleusercontent.com'],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: '/crm/:path*', destination: '/dashboard/crm/:path*' },
      { source: '/leads/:path*', destination: '/dashboard/leads/:path*' },
      { source: '/contractors/:path*', destination: '/dashboard/contractors/:path*' },
      { source: '/projects/:path*', destination: '/dashboard/projects/:path*' },
      { source: '/analytics/:path*', destination: '/dashboard/analytics/:path*' },
      { source: '/settings/:path*', destination: '/dashboard/settings/:path*' },
    ];
  },
};

module.exports = nextConfig;