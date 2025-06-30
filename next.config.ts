import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Legacy domains configuration (deprecated but still supported)
    domains: [
      'blog.elanroadtestrental.ca',
      'localhost',
      '127.0.0.1',
    ],
    // Modern remotePatterns configuration (recommended)
    remotePatterns: [
      // Your S3 buckets
      {
        protocol: 'https',
        hostname: 'dev-static-files-elan-car-app.s3.ca-central-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'static-files-elan-car-app.s3.ca-central-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      // Blog domain
      {
        protocol: 'https',
        hostname: 'blog.elanroadtestrental.ca',
        port: '',
        pathname: '/**',
      },
      // Local development
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3000',
        pathname: '/**',
      },
      // Common CDNs and image services
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      // Allow any S3 amazonaws.com subdomain for flexibility
      {
        protocol: 'https',
        hostname: '*.s3.amazonaws.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.ca-central-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
    // Additional image optimization settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

export default nextConfig;