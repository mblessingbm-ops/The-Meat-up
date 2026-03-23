/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['avatars.githubusercontent.com', 'lh3.googleusercontent.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['@react-email/components', 'resend'],
  },
  // Prevent static generation failures on authenticated/Supabase routes
  staticPageGenerationTimeout: 0,
}

module.exports = nextConfig
